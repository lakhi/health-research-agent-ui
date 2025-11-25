'use client'

import { motion } from 'framer-motion'
import React from 'react'

const ChatBlankState = () => {
  return (
    <section
      className="flex flex-col items-center text-center font-geist"
      aria-label="Welcome message"
    >
      <div className="flex max-w-3xl flex-col gap-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-[600] tracking-tight"
        >
          <div className="flex items-center justify-center gap-x-2 whitespace-nowrap font-medium">
            <span className="flex items-center font-[600]">
              The Health Research Network Agent
            </span>
          </div>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-muted-foreground max-w-2xl text-center text-lg"
        >
          Discover the members at the Health Research Network, and explore their research interests!
        </motion.p>
      </div>
    </section>
  )
}

export default ChatBlankState
