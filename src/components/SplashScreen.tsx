'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { getProjectConfig } from '@/config/projects'

export function SplashScreen() {
  const splash = getProjectConfig().splash
  if (!splash) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: splash.bg }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Image
          src={splash.logo}
          width={64}
          height={64}
          alt={`${splash.displayName} logo`}
          className="rounded-full"
        />
        <span
          className="text-5xl font-semibold tracking-tight"
          style={{ color: splash.fg, fontFamily: 'var(--font-poppins)' }}
        >
          {splash.displayName}
        </span>
      </motion.div>
    </motion.div>
  )
}
