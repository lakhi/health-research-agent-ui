'use client'

import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import Messages from './Messages'
import ScrollToBottom from '@/components/chat/ChatArea/ScrollToBottom'
import { StickToBottom } from 'use-stick-to-bottom'

const MessageArea = () => {
  const { messages } = useStore()
  const isBlankState = messages.length === 0

  return (
    <StickToBottom
      className="relative mb-4 flex min-h-0 w-full min-w-0 flex-grow flex-col"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="flex min-h-full flex-col justify-center">
        {/* On the welcome screen the gutters sit outside the max-w-2xl column, as in the
            input row and ChatHeader, so the text spans the input box exactly: same left
            edge, and the header's right edge. The conversation keeps them inside, as it
            always has, so its column is a little narrower than the input. */}
        <div className={cn('w-full min-w-0 pb-4', isBlankState && 'px-4')}>
          <div
            className={cn(
              'mx-auto w-full min-w-0 max-w-2xl space-y-9',
              !isBlankState && 'px-4'
            )}
          >
            <Messages messages={messages} />
          </div>
        </div>
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  )
}

export default MessageArea
