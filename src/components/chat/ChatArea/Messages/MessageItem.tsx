import Icon from '@/components/ui/icon'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { useStore } from '@/store'
import type { ChatMessage } from '@/types/os'
import Videos from './Multimedia/Videos'
import Images from './Multimedia/Images'
import Audios from './Multimedia/Audios'
import { memo } from 'react'
import { type Locale } from '@/config/projects'
import { STREAM_INTERRUPTED } from '@/hooks/useAIResponseStream'
import { useLocale } from '@/hooks/useLocale'
import AgentThinkingLoader from './AgentThinkingLoader'
import StillWorkingHint from '@/components/chat/ChatArea/Messages/StillWorkingHint'

interface MessageProps {
  message: ChatMessage
}

// An apology rather than an alarm: nothing the user did, and asking again fixes it
const INTERRUPTED_COPY: Record<Locale, { empty: string; partial: string }> = {
  en: {
    empty:
      'Sorry, the connection was interrupted before the answer arrived. Please ask your question again.',
    partial:
      'Sorry, the connection was interrupted before the answer was complete. Please ask your question again.'
  },
  de: {
    empty:
      'Entschuldigung, die Verbindung wurde unterbrochen, bevor die Antwort ankam. Bitte stellen Sie Ihre Frage erneut.',
    partial:
      'Entschuldigung, die Verbindung wurde unterbrochen, bevor die Antwort vollständig war. Bitte stellen Sie Ihre Frage erneut.'
  }
}

const AgentMessage = ({ message }: MessageProps) => {
  const { streamingErrorMessage } = useStore()
  const [locale] = useLocale()
  let errorNote
  if (message.streamingError && streamingErrorMessage === STREAM_INTERRUPTED) {
    // The theme's badge colours, as on the tool-call chips: a notice, not a failure
    errorNote = (
      <p
        role="alert"
        lang={locale}
        className="rounded-xl border border-primary/15 bg-badge px-3 py-2 text-sm text-badge-text"
      >
        {INTERRUPTED_COPY[locale][message.content ? 'partial' : 'empty']}
      </p>
    )
  } else if (message.streamingError) {
    errorNote = (
      <p role="alert" className="text-destructive">
        Oops! Something went wrong while streaming.{' '}
        {streamingErrorMessage ? (
          <>{streamingErrorMessage}</>
        ) : (
          'Please try refreshing the page or try again later.'
        )}
      </p>
    )
  }

  let messageContent
  // Text that already arrived stays readable above an error rather than replaced by it
  if (message.content || errorNote) {
    messageContent = (
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {message.content && (
          <MarkdownRenderer citations={message.citations}>
            {message.content}
          </MarkdownRenderer>
        )}
        {message.videos && message.videos.length > 0 && (
          <Videos videos={message.videos} />
        )}
        {message.images && message.images.length > 0 && (
          <Images images={message.images} />
        )}
        {message.audio && message.audio.length > 0 && (
          <Audios audio={message.audio} />
        )}
        {errorNote}
      </div>
    )
  } else if (message.response_audio) {
    if (!message.response_audio.transcript) {
      messageContent = (
        <div className="mt-2 flex items-start">
          <AgentThinkingLoader />
        </div>
      )
    } else {
      messageContent = (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <MarkdownRenderer citations={message.citations}>
            {message.response_audio.transcript}
          </MarkdownRenderer>
          {message.response_audio.content && message.response_audio && (
            <Audios audio={[message.response_audio]} />
          )}
        </div>
      )
    }
  } else {
    // A live region from the start, so screen readers announce the hint when it appears
    messageContent = (
      <div className="mt-2 flex flex-col items-start gap-2" role="status">
        <AgentThinkingLoader />
        <StillWorkingHint />
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-row items-start gap-4 font-primary">
      <div className="flex-shrink-0">
        <Icon type="agent" size="sm" />
      </div>
      {messageContent}
    </div>
  )
}

const UserMessage = memo(({ message }: MessageProps) => {
  return (
    <div className="flex w-full min-w-0 items-start gap-4 pt-4 text-start">
      <div className="flex-shrink-0">
        <Icon type="user" size="sm" />
      </div>
      <div className="text-md min-w-0 flex-1 break-words rounded-lg font-primary text-secondary">
        {message.content}
      </div>
    </div>
  )
})

AgentMessage.displayName = 'AgentMessage'
UserMessage.displayName = 'UserMessage'
export { AgentMessage, UserMessage }
