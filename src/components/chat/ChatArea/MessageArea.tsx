'use client'

import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import Messages from './Messages'
import ScrollToBottom from '@/components/chat/ChatArea/ScrollToBottom'
import { StickToBottom } from 'use-stick-to-bottom'

const MessageArea = () => {
  const { messages } = useStore()

  return (
    <StickToBottom
      className="relative mb-4 flex min-h-0 w-full min-w-0 flex-grow flex-col"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="flex min-h-full flex-col justify-center">
        <div
          className={cn(
            'mx-auto w-full min-w-0 space-y-9 px-4 pb-4',
            // Until the first message, the welcome text spans the input box exactly
            // (44rem = its 42rem + these px-4 gutters), so the left-aligned text
            // shares its left edge and the header's right edge
            messages.length === 0 ? 'max-w-[44rem]' : 'max-w-2xl'
          )}
        >
          <Messages messages={messages} />
        </div>
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  )
}

export default MessageArea
