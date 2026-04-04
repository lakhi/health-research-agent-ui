'use client'
import { useState, useEffect, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/chat/Sidebar/Sidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { SplashScreen } from '@/components/SplashScreen'

export default function Home() {
  const hasEnvToken = !!process.env.NEXT_PUBLIC_OS_SECURITY_KEY
  const envToken = process.env.NEXT_PUBLIC_OS_SECURITY_KEY || ''
  const sidebarEnabled = process.env.NEXT_PUBLIC_SIDEBAR_VIEW_ACCESS !== 'false'
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>
      <Suspense fallback={null}>
        <div className="flex h-screen bg-background/80">
          {sidebarEnabled && (
            <Sidebar hasEnvToken={hasEnvToken} envToken={envToken} />
          )}
          <ChatArea />
        </div>
      </Suspense>
    </>
  )
}
