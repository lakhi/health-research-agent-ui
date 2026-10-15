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
import StillWorkingHint from './StillWorkingHint'

interface MessageProps {
  message: ChatMessage
}

const INTERRUPTED_COPY: Record<Locale, string> = {
  en: 'The connection was interrupted before the answer arrived. Please ask your question again.',
  de: 'Die Verbindung wurde unterbrochen, bevor die Antwort ankam. Bitte stellen Sie Ihre Frage erneut.'
}

const AgentMessage = ({ message }: MessageProps) => {
  const { streamingErrorMessage } = useStore()
  const [locale] = useLocale()
  let messageContent
  if (message.streamingError && streamingErrorMessage === STREAM_INTERRUPTED) {
    messageContent = (
      <p className="text-destructive" lang={locale}>
        {INTERRUPTED_COPY[locale]}
      </p>
    )
  } else if (message.streamingError) {
    messageContent = (
      <p className="text-destructive">
        Oops! Something went wrong while streaming.{' '}
        {streamingErrorMessage ? (
          <>{streamingErrorMessage}</>
        ) : (
          'Please try refreshing the page or try again later.'
        )}
      </p>
    )
  } else if (message.content) {
    messageContent = (
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <MarkdownRenderer citations={message.citations}>
          {message.content}
        </MarkdownRenderer>
        {message.videos && message.videos.length > 0 && (
          <Videos videos={message.videos} />
        )}
        {message.images && message.images.length > 0 && (
          <Images images={message.images} />
        )}
        {message.audio && message.audio.length > 0 && (
          <Audios audio={message.audio} />
        )}
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
    messageContent = (
      <div className="mt-2 flex flex-col items-start gap-2">
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
