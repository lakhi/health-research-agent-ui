'use client'

import { motion } from 'framer-motion'
import React from 'react'
import {
  getProjectConfig,
  type Locale,
  type WelcomeCopy
} from '@/config/projects'
import Icon from '@/components/ui/icon/Icon'
import { type IconType } from '@/components/ui/icon/types'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

const projectConfig = getProjectConfig()

/**
 * One welcome-screen field in the active language. A field missing from the German
 * copy falls back to English instead of vanishing (a dropped privacy notice would
 * otherwise go unnoticed), and carries its own `lang` so screen readers stay right.
 */
const localized = (key: keyof WelcomeCopy, locale: Locale) => {
  const german = locale === 'de' ? projectConfig.de?.[key] : undefined
  return german
    ? { text: german, lang: 'de' }
    : { text: projectConfig[key], lang: 'en' }
}

const ChatBlankState = () => {
  const [locale] = useLocale()
  const description = localized('description', locale)
  const note = localized('note', locale)
  const privacy = localized('privacyNotice', locale)

  return (
    <section
      className="flex w-full min-w-0 flex-col items-center text-center font-primary"
      aria-label="Welcome message"
    >
      <div className="flex w-full min-w-0 max-w-3xl flex-col gap-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-display text-xl font-[600] tracking-tight sm:text-3xl"
        >
          <div className="flex items-center justify-center gap-x-3 font-medium">
            {projectConfig.icon && (
              <Icon
                type={projectConfig.icon as IconType}
                size="default"
                className={cn(
                  'shrink-0',
                  projectConfig.landingIconClassName ?? 'size-8'
                )}
              />
            )}
            <span className="min-w-0 break-words font-[600]">
              {projectConfig.name}
            </span>
          </div>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-muted-foreground max-w-2xl text-center text-lg"
          lang={description.lang}
        >
          {description.text}
        </motion.p>
        {(note.text || privacy.text) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex max-w-2xl flex-col gap-y-4 text-center text-sm text-muted"
          >
            {note.text && <p lang={note.lang}>{note.text}</p>}
            {privacy.text && <p lang={privacy.lang}>{privacy.text}</p>}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default ChatBlankState
