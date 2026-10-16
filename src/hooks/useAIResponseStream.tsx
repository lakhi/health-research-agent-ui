import { RunEvent, RunResponseContent } from '@/types/os'
import { useCallback } from 'react'

/**
 * Processes a single JSON chunk by passing it to the provided callback.
 * @param chunk - A parsed JSON object of type RunResponseContent.
 * @param onChunk - Callback to handle the chunk.
 */
function processChunk(
  chunk: RunResponseContent,
  onChunk: (chunk: RunResponseContent) => void
) {
  onChunk(chunk)
}

// TODO: Make new format the default and phase out legacy format

/**
 * Detects if the incoming data is in the legacy format (direct RunResponseContent)
 * @param data - The parsed data object
 * @returns true if it's in the legacy format, false if it's in the new format
 */
function isLegacyFormat(data: RunResponseContent): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'event' in data &&
    !('data' in data) &&
    typeof data.event === 'string'
  )
}

interface NewFormatData {
  event: string
  data: string | Record<string, unknown>
}

/**
 * No bytes for this long ends the request with an error. Healthy runs go quiet for
 * ~1–2 s at most (model call, knowledge search) — measured on HeX in Oct 2026 — so 30 s
 * means the connection is gone: without this the reply sat on "…" forever.
 */
const STREAM_INACTIVITY_TIMEOUT_MS = 30_000

/** Every complete run ends with one of these; a stream that closes without one was cut off */
const TERMINAL_EVENTS = new Set<string>([
  RunEvent.RunCompleted,
  RunEvent.RunError,
  RunEvent.RunCancelled,
  RunEvent.TeamRunCompleted,
  RunEvent.TeamRunError,
  RunEvent.TeamRunCancelled
])

/** streamingErrorMessage value MessageItem renders as the localized "connection interrupted" text */
export const STREAM_INTERRUPTED = 'stream-interrupted'

/** The stream went silent or closed before the run finished */
class StreamInterruptedError extends Error {
  constructor() {
    super(STREAM_INTERRUPTED)
    this.name = 'StreamInterruptedError'
  }
}

class HttpStatusError extends Error {
  status: number
  payload: unknown

  constructor(status: number, payload: unknown, message: string) {
    super(message)
    this.name = 'HttpStatusError'
    this.status = status
    this.payload = payload
  }
}

type LegacyEventFormat = RunResponseContent & { event: string }

function convertNewFormatToLegacy(
  newFormatData: NewFormatData
): LegacyEventFormat {
  const { event, data } = newFormatData

  // Parse the data field if it's a string
  let parsedData: Record<string, unknown>
  if (typeof data === 'string') {
    try {
      // First try to parse as JSON
      parsedData = JSON.parse(data)
    } catch {
      parsedData = {}
    }
  } else {
    parsedData = data
  }

  const { ...cleanData } = parsedData

  // Convert to legacy format by flattening the structure
  return {
    event: event,
    ...cleanData
  } as LegacyEventFormat
}
/**
 * Parses a string buffer to extract complete JSON objects.
 *
 * This function discards any extraneous data before the first '{', then
 * repeatedly finds and processes complete JSON objects.
 *
 * @param text - The accumulated string buffer.
 * @param onChunk - Callback to process each parsed JSON object.
 * @returns Remaining string that did not form a complete JSON object.
 */
/**
 * Extracts complete JSON objects from a buffer string **incrementally**.
 * - It allows partial JSON objects to accumulate across chunks.
 * - It ensures real-time streaming updates.
 */
function parseBuffer(
  buffer: string,
  onChunk: (chunk: RunResponseContent) => void
): string {
  let currentIndex = 0
  let jsonStartIndex = buffer.indexOf('{', currentIndex)

  // Process as many complete JSON objects as possible.
  while (jsonStartIndex !== -1 && jsonStartIndex < buffer.length) {
    let braceCount = 0
    let inString = false
    let escapeNext = false
    let jsonEndIndex = -1
    let i = jsonStartIndex

    // Walk through the string to find the matching closing brace.
    for (; i < buffer.length; i++) {
      const char = buffer[i]

      if (inString) {
        if (escapeNext) {
          escapeNext = false
        } else if (char === '\\') {
          escapeNext = true
        } else if (char === '"') {
          inString = false
        }
      } else {
        if (char === '"') {
          inString = true
        } else if (char === '{') {
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            jsonEndIndex = i
            break
          }
        }
      }
    }

    // If we found a complete JSON object, try to parse it.
    if (jsonEndIndex !== -1) {
      const jsonString = buffer.slice(jsonStartIndex, jsonEndIndex + 1)

      try {
        const parsed = JSON.parse(jsonString)

        // Check if it's in the legacy format - use as is
        if (isLegacyFormat(parsed)) {
          processChunk(parsed, onChunk)
        } else {
          // New format - convert to legacy format for compatibility
          const legacyChunk = convertNewFormatToLegacy(parsed)
          processChunk(legacyChunk, onChunk)
        }
      } catch {
        // Move past the starting brace to avoid re-parsing the same invalid JSON.
        jsonStartIndex = buffer.indexOf('{', jsonStartIndex + 1)
        continue
      }

      // Move currentIndex past the parsed JSON and trim any leading whitespace.
      currentIndex = jsonEndIndex + 1
      buffer = buffer.slice(currentIndex).trim()

      // Reset currentIndex and search for the next JSON object.
      currentIndex = 0
      jsonStartIndex = buffer.indexOf('{', currentIndex)
    } else {
      // If a complete JSON object is not found, break out and wait for more data.
      break
    }
  }

  // Return any unprocessed (partial) data.
  return buffer
}

/**
 * Custom React hook to handle streaming API responses as JSON objects.
 *
 * This hook supports two streaming formats:
 * 1. Legacy format: Direct JSON objects matching RunResponseContent interface
 * 2. New format: Event/data structure with { event: string, data: string|object }
 *
 * The hook:
 * - Accumulates partial JSON data from streaming responses.
 * - Extracts complete JSON objects and processes them via onChunk.
 * - Automatically detects new format and converts it to legacy format for compatibility.
 * - Parses stringified data field if it's a string (supports both JSON and Python dict syntax).
 * - Removes redundant event field from data object during conversion.
 * - Handles errors via onError and signals completion with onComplete.
 *
 * @returns An object containing the streamResponse function.
 */
export default function useAIResponseStream() {
  const streamResponse = useCallback(
    async (options: {
      apiUrl: string
      headers?: Record<string, string>
      requestBody: FormData | Record<string, unknown>
      onChunk: (chunk: RunResponseContent) => void
      onError: (error: Error) => void
      onComplete: () => void
    }): Promise<void> => {
      const {
        apiUrl,
        headers = {},
        requestBody,
        onChunk,
        onError,
        onComplete
      } = options

      // Buffer to accumulate partial JSON data.
      let buffer = ''

      // Inactivity watchdog: re-armed on every received chunk. Firing aborts the fetch, so
      // the server cancels the run and a late answer can't appear under the error.
      const controller = new AbortController()
      let watchdog: ReturnType<typeof setTimeout> | undefined
      let sawTerminalEvent = false
      // A phone suspends a backgrounded page's timers and reads alike, and on return the
      // overdue timer may run before the data that arrived meanwhile is read. So time
      // spent hidden never counts as silence: the watchdog starts over instead.
      let hiddenSinceArmed = document.hidden
      const armWatchdog = () => {
        clearTimeout(watchdog)
        hiddenSinceArmed = document.hidden
        watchdog = setTimeout(() => {
          if (hiddenSinceArmed) armWatchdog()
          else controller.abort()
        }, STREAM_INACTIVITY_TIMEOUT_MS)
      }
      const onVisibilityChange = () => {
        if (document.hidden) hiddenSinceArmed = true
        else if (!sawTerminalEvent) armWatchdog()
      }
      document.addEventListener('visibilitychange', onVisibilityChange)

      const trackChunk = (chunk: RunResponseContent) => {
        if (chunk.event && TERMINAL_EVENTS.has(chunk.event)) {
          // The run is over; the API may keep the stream open a while (usage writes,
          // citations), and that is no reason to abort it
          sawTerminalEvent = true
          clearTimeout(watchdog)
        }
        onChunk(chunk)
      }

      try {
        armWatchdog()
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          method: 'POST',
          headers: {
            // Set content-type only for non-FormData requests.
            ...(!(requestBody instanceof FormData) && {
              'Content-Type': 'application/json'
            }),
            ...headers
          },
          body:
            requestBody instanceof FormData
              ? requestBody
              : JSON.stringify(requestBody)
        })

        if (!response.ok) {
          let errorPayload: unknown = null

          try {
            errorPayload = await response.json()
          } catch {
            try {
              errorPayload = await response.text()
            } catch {
              errorPayload = null
            }
          }

          const errorMessage =
            typeof errorPayload === 'object' &&
            errorPayload !== null &&
            'detail' in errorPayload
              ? String(errorPayload.detail)
              : `HTTP ${response.status}`

          throw new HttpStatusError(response.status, errorPayload, errorMessage)
        }
        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        // Recursively process the stream.
        const processStream = async (): Promise<void> => {
          const { done, value } = await reader.read()
          if (done) {
            // Process any final data in the buffer.
            buffer = parseBuffer(buffer, trackChunk)
            if (!sawTerminalEvent) {
              throw new StreamInterruptedError()
            }
            onComplete()
            return
          }
          if (!sawTerminalEvent) armWatchdog()
          // Decode, sanitize, and accumulate the chunk
          buffer += decoder.decode(value, { stream: true })

          // Parse any complete JSON objects available in the buffer.
          buffer = parseBuffer(buffer, trackChunk)
          await processStream()
        }
        await processStream()
      } catch (error) {
        // The answer is complete; a connection lost after that costs nothing
        if (sawTerminalEvent) {
          onComplete()
          return
        }

        if (
          controller.signal.aborted ||
          error instanceof StreamInterruptedError
        ) {
          onError(new StreamInterruptedError())
          return
        }

        if (error instanceof HttpStatusError) {
          onError(error)
          return
        }

        if (error instanceof Error) {
          onError(error)
          return
        }

        if (typeof error === 'object' && error !== null && 'detail' in error) {
          onError(new Error(String(error.detail)))
          return
        }

        onError(new Error(String(error)))
      } finally {
        clearTimeout(watchdog)
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    },
    []
  )

  return { streamResponse }
}
