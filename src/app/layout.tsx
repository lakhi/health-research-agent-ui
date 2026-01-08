import type { Metadata } from 'next'
import { DM_Mono, Geist, Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { getProjectConfig } from '@/config/projects'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  weight: '400',
  subsets: ['latin']
})

const inter = Inter({
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: '400'
})

// Get project-specific metadata
const projectConfig = getProjectConfig()

export const metadata: Metadata = {
  title: projectConfig.metadata.title,
  description: projectConfig.metadata.description
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const isHealthSoc = projectConfig.id === 'healthsoc-network-chatbot'
  const fontVariables = isHealthSoc
    ? `${inter.variable} ${dmMono.variable}`
    : `${geistSans.variable} ${dmMono.variable}`

  return (
    <html lang="en">
      <body
        className={`${fontVariables} antialiased`}
        data-project={projectConfig.id}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}
