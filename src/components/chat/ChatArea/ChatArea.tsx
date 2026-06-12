'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
import { getProjectConfig } from '@/config/projects'

const ChatArea = () => {
  const { disclaimer } = getProjectConfig()

  return (
    <main className="relative m-1.5 flex flex-grow flex-col rounded-xl bg-background">
      <MessageArea />
      <div className="sticky bottom-0 px-4 pb-2">
        <ChatInput />
        {disclaimer && (
          <p className="mx-auto mt-1 w-full max-w-2xl text-center font-primary text-xs text-muted">
            {disclaimer}
          </p>
        )}
      </div>
    </main>
  )
}

export default ChatArea
