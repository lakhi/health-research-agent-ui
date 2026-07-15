import type { Metadata, Viewport } from 'next'
import { DM_Mono, Inter, Poppins, Source_Serif_4 } from 'next/font/google'
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

/* Uni Wien CD web fonts (CD-Manual §5.2): Inter for UI/body,
 * Source Serif 4 for display/headlines. Applied per-project via
 * --font-primary / --font-display in globals.css. */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  weight: ['400', '600'],
  subsets: ['latin']
})

// Get project-specific metadata
const projectConfig = getProjectConfig()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export const metadata: Metadata = {
  title: projectConfig.metadata.title,
  description: projectConfig.metadata.description
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const fontVariables = `${poppins.variable} ${dmMono.variable} ${inter.variable} ${sourceSerif.variable}`

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
