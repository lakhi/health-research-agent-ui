'use client'

import { LanguageToggle } from '@/components/LanguageToggle'
import { NewChatLink } from '@/components/NewChatLink'
import { getProjectConfig } from '@/config/projects'
import { hasGerman } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

const { showNewChat } = getProjectConfig()

// One look for both controls, and one grid cell (see below)
const CONTROL =
  'col-start-1 row-start-1 rounded-full border border-accent/40 px-3 py-1 font-primary text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

/**
 * Top-right row of the chat column: the EN/DE toggle on the welcome screen (refs #16),
 * the New chat link from the first message on (refs #17) — the welcome screen already
 * is a new chat.
 *
 * Both controls share one grid cell and the inactive one is made invisible rather than
 * unmounted, so the row keeps its height when the first message swaps them — even for a
 * project with only one of the two — and the conversation never jumps. The row sits
 * above the column rather than floating over it, so a tall welcome text on a short
 * phone screen can never slide under it.
 */
const ChatHeader = () => {
  const isBlankState = useStore((s) => s.messages.length === 0)

  if (!hasGerman && !showNewChat) return null

  return (
    <div className="grid justify-items-end px-3 pt-3">
      {hasGerman && (
        <LanguageToggle className={cn(CONTROL, !isBlankState && 'invisible')} />
      )}
      {showNewChat && (
        <NewChatLink className={cn(CONTROL, isBlankState && 'invisible')} />
      )}
    </div>
  )
}

export default ChatHeader
