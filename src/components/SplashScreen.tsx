'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]"
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
          src="/hex-gig-logo.png"
          width={64}
          height={64}
          alt="HeX-GiG logo"
          className="rounded-full"
        />
        <span
          className="text-5xl font-semibold tracking-tight text-[#1E293B]"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          HeX-GiG
        </span>
      </motion.div>
    </motion.div>
  )
}
