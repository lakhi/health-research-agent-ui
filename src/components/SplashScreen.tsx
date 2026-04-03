'use client'
import { motion } from 'framer-motion'

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
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="6" fill="#1E40AF" />
          <circle cx="8" cy="8" r="3" fill="white" />
          <circle cx="24" cy="8" r="3" fill="white" />
          <circle cx="8" cy="24" r="3" fill="white" />
          <circle cx="24" cy="24" r="3" fill="white" />
          <line
            x1="8"
            y1="8"
            x2="24"
            y2="8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="24"
            y1="8"
            x2="24"
            y2="24"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="24"
            x2="24"
            y2="24"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="8"
            x2="24"
            y2="24"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
        </svg>
        <span
          className="text-5xl font-semibold tracking-tight text-[#1E293B]"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          NeX
        </span>
      </motion.div>
    </motion.div>
  )
}
