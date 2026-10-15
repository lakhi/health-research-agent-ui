'use client'

import { useEffect, useState } from 'react'

import { type Locale } from '@/config/projects'
import { useLocale } from '@/hooks/useLocale'
import { useStore } from '@/store'

/** Past Nielsen's ~10 s attention limit; typical answers start within 1–4 s */
const HINT_AFTER_MS = 15_000

const COPY: Record<Locale, string> = {
  en: 'Still working on your answer…',
  de: 'Ihre Antwort wird noch erstellt…'
}

/**
 * Shown under the "…" while a run is streaming and ~15 s have passed without answer
 * text. Timed from the user's question, not from mount: the agent message remounts as
 * chunks arrive (its key includes a created_at each chunk rewrites), which would keep
 * resetting a mount-based timer.
 */
const StillWorkingHint = () => {
  const [locale] = useLocale()
  const isStreaming = useStore((state) => state.isStreaming)
  const askedAt = useStore((state) => {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      if (state.messages[i].role === 'user') return state.messages[i].created_at
    }
    return undefined
  })
  const dueAt =
    isStreaming && askedAt !== undefined
      ? askedAt * 1000 + HINT_AFTER_MS
      : undefined
  // Starts visible when a remount lands past the deadline, so the hint doesn't flicker
  const [visible, setVisible] = useState(
    () => dueAt !== undefined && Date.now() >= dueAt
  )

  useEffect(() => {
    if (dueAt === undefined) {
      setVisible(false)
      return
    }
    const remaining = dueAt - Date.now()
    setVisible(remaining <= 0)
    if (remaining <= 0) return
    const timer = setTimeout(() => setVisible(true), remaining)
    return () => clearTimeout(timer)
  }, [dueAt])

  if (!visible) return null
  return (
    <p className="text-xs text-muted" lang={locale}>
      {COPY[locale]}
    </p>
  )
}

export default StillWorkingHint
