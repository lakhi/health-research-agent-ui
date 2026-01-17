import type { Metadata } from 'next'
import { DM_Mono, Poppins } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { getProjectConfig } from '@/config/projects'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
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
  const fontVariables = `${poppins.variable} ${dmMono.variable}`

  return (
    <html lang="en" className={fontVariables}>
      <body
        className="bg-background text-secondary"
        data-project={projectConfig.id}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}
