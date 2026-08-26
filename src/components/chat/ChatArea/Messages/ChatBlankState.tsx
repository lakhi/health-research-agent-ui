'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { getProjectConfig } from '@/config/projects'
import Icon from '@/components/ui/icon/Icon'
import { type IconType } from '@/components/ui/icon/types'
import { cn } from '@/lib/utils'

const projectConfig = getProjectConfig()

const ChatBlankState = () => {
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
        >
          {projectConfig.description}
        </motion.p>
        {projectConfig.privacyNotice && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="max-w-2xl text-center text-sm text-muted"
          >
            {projectConfig.privacyNotice}
          </motion.p>
        )}
      </div>
    </section>
  )
}

export default ChatBlankState
