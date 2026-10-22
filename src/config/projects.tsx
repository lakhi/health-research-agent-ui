/**
 * Multi-Project Configuration
 *
 * This file defines all project-specific configurations including:
 * - API endpoints
 * - Branding (titles, descriptions)
 * - Theme (colors, fonts)
 * - Metadata
 *
 * Projects are selected at build time via NEXT_PUBLIC_PROJECT_ID environment variable
 */

import React from 'react'

import { cn } from '@/lib/utils'

export type ProjectId = 'hex-gig' | 'vax-study-chatbot' | 'ssc-psych-chatbot'

export interface ProjectTheme {
  colors: {
    brand: string
    primary: string
    primaryAccent: string
    background: {
      default: string
      secondary: string
    }
    secondary: string
    accent: string
    accentSecondary?: string
    surface?: string
    muted: string
    destructive: string
    positive: string
  }
  fonts: {
    primary: string
    mono: string
  }
}

export interface ProjectSplash {
  logo: string
  displayName: string
  bg: string
  fg: string
  /** Size/rounding for the splash logo (defaults to 'size-16 rounded-full') */
  logoClassName?: string
}

export type Locale = 'en' | 'de'

/** Project copy that differs between languages: the welcome screen and the input (refs #16) */
export interface LocalizedCopy {
  description: string | React.ReactNode
  /** Small-print line(s) under the description, above the privacy notice */
  note?: React.ReactNode
  /** Short privacy reassurance shown as its own line under the description (blank state) */
  privacyNotice?: string | React.ReactNode
  /** Placeholder text for the chat input (defaults to 'Ask anything') */
  inputPlaceholder?: string
}

/** The project's own fields are its default (EN) copy */
export interface ProjectConfig extends LocalizedCopy {
  id: ProjectId
  name: string
  apiEndpoint: string
  theme: ProjectTheme
  metadata: {
    title: string
    description: string
  }
  icon?: string
  splash?: ProjectSplash
  /** Persistent notice rendered under the chat input (e.g. accuracy caveat) */
  disclaimer?: string
  /**
   * German copy. When set, the blank state shows an EN/DE toggle and `?lang=de` renders
   * this copy (a field left out falls back to English). Agent answers aren't affected.
   */
  de?: LocalizedCopy
  /** Size classes for the landing-page title icon (defaults to 'size-8') */
  landingIconClassName?: string
  /**
   * Pre-selected agent id used as the DEFAULT value of the `?agent=` URL param.
   * When set, the chat input is enabled on first paint (no network wait) and the param
   * is kept out of the URL (writing the default clears it; nuqs clearOnDefault). MUST
   * exactly equal the backend agent id returned by /agents, else initialize() will write
   * the real id into the URL. Leave undefined for projects that auto-select an agent.
   */
  defaultAgentId?: string
  /**
   * Show the "New chat" link, which opens a fresh copy of the app (its own root, base
   * path included) in a new tab once a conversation has started — chats aren't
   * persisted, so starting over in place would lose the current thread (refs #17).
   */
  showNewChat?: boolean
}

const ExternalLink = ({
  href,
  className,
  children
}: {
  href: string
  className?: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn('underline hover:opacity-80', className)}
  >
    {children}
  </a>
)

// The welcome text flows freely (no <br />), so short phrases that read badly split
// across lines are kept whole instead. nowrap blocks hyphenation inside them too,
// which non-breaking spaces wouldn't. Only for short runs — an unbreakable one wider
// than a phone widens the whole page.
const NO_SPLIT = 'whitespace-nowrap'
// For longer runs: kept whole while they fit on a line, wrapped inside themselves only
// when a full line is too narrow (large system text on a phone), so they can't widen
// the page. Only where nothing follows them: a full stop after one could wrap alone.
const KEEP_WHOLE = 'inline-block'

// Shown on both welcome-screen languages — bump them together
const HEX_GIG_LAST_UPDATE = {
  en: <span className={NO_SPLIT}>22nd October 2026</span>,
  de: <span className={NO_SPLIT}>22. Oktober 2026</span>
}

const HEX_GIG_WIKI = 'https://wiki.univie.ac.at/x/WB02Nw'

const projects: Record<ProjectId, ProjectConfig> = {
  'hex-gig': {
    id: 'hex-gig',
    name: "HeX-GiG (GiG's Health Explorer)",
    description: (
      <>
        HeX-GiG is the AI-powered chatbot of the{' '}
        <ExternalLink href="https://gig.univie.ac.at/en">
          Health in Society Research Network (GiG)
        </ExternalLink>{' '}
        at the University of Vienna. Here you can find out more about the health
        research carried out by our members and about the GiG’s activities.
      </>
    ),
    note: (
      <>
        In case you are a network member and would like to update your
        representative health research, you can do it through this{' '}
        <ExternalLink href={HEX_GIG_WIKI} className={NO_SPLIT}>
          wiki link
        </ExternalLink>
        . Last update: {HEX_GIG_LAST_UPDATE.en}
      </>
    ),
    privacyNotice: (
      <>
        Your privacy is our top priority. We do not store your chats and will
        never ask you for your identity. Please do not enter any personal,
        sensitive or confidential information.{' '}
        <ExternalLink
          href="https://gig.univie.ac.at/en/hex-gig/data-protection-declaration"
          className={KEEP_WHOLE}
        >
          Data Protection Declaration
        </ExternalLink>
      </>
    ),
    de: {
      description: (
        <>
          HeX-GiG ist der KI-gestützte Chatbot des{' '}
          <ExternalLink href="https://gig.univie.ac.at/">
            Forschungsverbundes Gesundheit in Gesellschaft (GiG)
          </ExternalLink>{' '}
          der Universität Wien. Hier erfahren Sie mehr über die
          Gesundheitsforschung unserer Mitglieder und über die Aktivitäten des
          GiG.
        </>
      ),
      note: (
        <>
          Falls Sie Mitglied des Forschungsverbundes sind und Ihre
          repräsentative Gesundheitsforschung aktualisieren möchten, können Sie
          dies über diesen{' '}
          <ExternalLink href={HEX_GIG_WIKI} className={NO_SPLIT}>
            Wiki-Link
          </ExternalLink>{' '}
          tun. Letzte Aktualisierung: {HEX_GIG_LAST_UPDATE.de}
        </>
      ),
      privacyNotice: (
        <>
          Ihre Privatsphäre steht an erster Stelle. Wir speichern Ihre Chats
          nicht und fragen Sie niemals nach Ihrer Identität. Bitte geben Sie
          keine persönlichen, sensiblen oder vertraulichen Informationen ein.{' '}
          <ExternalLink
            href="https://gig.univie.ac.at/hex-gig/datenschutzerklaerung"
            className={KEEP_WHOLE}
          >
            Datenschutzerklärung
          </ExternalLink>
        </>
      ),
      inputPlaceholder: 'Was möchten Sie wissen?'
    },
    inputPlaceholder: 'What do you want to know?',
    defaultAgentId: 'hex',
    showNewChat: true,
    apiEndpoint:
      'https://hex-gig-agent-api.bravemeadow-0cb4208f.swedencentral.azurecontainerapps.io',
    theme: {
      colors: {
        brand: '#1E40AF', // University blue
        primary: '#1E293B', // Dark headings/strong text
        primaryAccent: '#FFFFFF', // Input backgrounds
        background: {
          default: '#F8FAFC', // Subtle gray main bg
          secondary: '#EEF2F6' // Sidebar/cards
        },
        secondary: '#334155', // Body text (readable!)
        accent: '#1E40AF', // Borders, focus rings
        accentSecondary: '#8B5CF6', // Purple accent
        surface: '#FFFFFF', // Elevated surfaces
        muted: '#64748B', // Placeholders, subtle text
        destructive: '#DC2626', // Red
        positive: '#059669' // Green
      },
      fonts: {
        primary: 'Poppins',
        mono: 'DM Mono'
      }
    },
    metadata: {
      title: 'HeX-GiG',
      description:
        'Explore the research expertise of the Health in Society Research Network (GiG) members through their self-selected publications in health, and stay informed with the latest news regarding the activities of the network.'
    },
    icon: 'hex-gig',
    splash: {
      logo: '/hex-gig-logo.png',
      displayName: 'HeX-GiG',
      bg: '#F8FAFC',
      fg: '#1E293B'
    }
  },
  'vax-study-chatbot': {
    id: 'vax-study-chatbot',
    name: 'Research Studies Chatbot',
    description:
      'Hello! Im a Chatbot designed to help you understand the marhinovirus and its vaccination. I am also here to help you with the choice to either vaccinate or not. Ask me anything you want. If you don\'t know where to start, just ask me "what is the marhinovirus?"',
    apiEndpoint:
      // process.env.NEXT_PUBLIC_API_ENDPOINT || TODO: doesn't work, fix it!
      'https://marhinovirus-api.wittywave-d78264d4.swedencentral.azurecontainerapps.io',
    theme: {
      colors: {
        brand: '#1E40AF', // University blue
        primary: '#1E293B', // Dark headings/strong text
        primaryAccent: '#FFFFFF', // Input backgrounds
        background: {
          default: '#F8FAFC', // Subtle gray main bg
          secondary: '#EEF2F6' // Sidebar/cards
        },
        secondary: '#334155', // Body text (readable!)
        accent: '#1E40AF', // Borders, focus rings
        accentSecondary: '#8B5CF6', // Purple accent
        surface: '#FFFFFF', // Elevated surfaces
        muted: '#64748B', // Placeholders, subtle text
        destructive: '#DC2626', // Red
        positive: '#059669' // Green
      },
      fonts: {
        primary: 'Poppins',
        mono: 'DM Mono'
      }
    },
    metadata: {
      title: 'Research Studies Chatbot',
      description:
        'Your dedicated assistant for understanding the Marhinovirus. Explore comprehensive information on its transmission, symptoms, and effective prevention strategies.'
    }
  },
  'ssc-psych-chatbot': {
    id: 'ssc-psych-chatbot',
    name: 'SSC Psychology Assistant',
    description:
      'AI assistant for the Psychology Student Service Center at the University of Vienna. Ask about applications, curricula, exam regulations, and study organization — answers are linked to their source pages.',
    apiEndpoint:
      'https://ssc-psych-api.politesmoke-3283667d.swedencentral.azurecontainerapps.io',
    defaultAgentId: 'ssc',
    showNewChat: true,
    privacyNotice: (
      <>
        Your privacy comes first. We don&apos;t store your conversations and
        never ask who you are — so there&apos;s no need to share personal,
        sensitive, or confidential information.
      </>
    ),
    // TODO(#16): placeholder — replace with the real German copy
    de: {
      description: '[DE] Beschreibung folgt.',
      privacyNotice: '[DE] Datenschutzhinweis folgt.'
    },
    inputPlaceholder: 'Ask about your psychology studies…',
    landingIconClassName: 'size-12',
    theme: {
      // Uni Wien CD-Manual (Frühling 2026): Universitätsblau actions,
      // Blauschwarz/Grau text ramp, Orange/Gelb warm accents (§2.2, §5.1-5.2)
      colors: {
        brand: '#0063A6', // Universitätsblau
        primary: '#032138', // Blauschwarz - headings/strong text
        primaryAccent: '#FFFFFF', // Input backgrounds
        background: {
          default: '#F8FAFC', // Subtle gray main bg
          secondary: '#EEF2F6' // Sidebar/cards
        },
        secondary: '#1C374C', // Grau 1 - body text
        accent: '#0063A6', // Links, buttons, focus rings
        accentSecondary: '#FF8552', // Orange - warm accent
        surface: '#FFFFFF',
        muted: '#354D60', // Grau 2 - captions/placeholders
        destructive: '#DC2626',
        positive: '#059669'
      },
      fonts: {
        primary: 'Inter',
        mono: 'DM Mono'
      }
    },
    metadata: {
      title: 'SSC Psychology Assistant',
      description:
        'AI assistant for the Psychology Student Service Center at the University of Vienna, with answers traceable to their source pages.'
    },
    icon: 'ssc-psych',
    disclaimer:
      'AI can make mistakes — that’s why every answer links to its official source page, so you can check for yourself. Still unsure? The SSC Psychologie team is happy to help.',
    splash: {
      logo: '/ssc-psych-logo.svg',
      displayName: 'SSC Psychologie',
      bg: '#F8FAFC',
      fg: '#0063A6',
      logoClassName: 'size-24 rounded-2xl'
    }
  }
}

/**
 * Get the current project configuration based on NEXT_PUBLIC_PROJECT_ID
 * Falls back to 'vax-study-chatbot' if environment variable is not set
 */
export function getProjectConfig(): ProjectConfig {
  const projectId = (process.env.NEXT_PUBLIC_PROJECT_ID ||
    'vax-study-chatbot') as ProjectId

  const config = projects[projectId]

  if (!config) {
    console.warn(
      `Invalid PROJECT_ID: ${projectId}. Falling back to vax-study-chatbot`
    )
    return projects['vax-study-chatbot']
  }

  return config
}

/**
 * Get a specific project configuration by ID
 */
export function getProjectById(projectId: ProjectId): ProjectConfig {
  return projects[projectId]
}

/**
 * Get all available project configurations
 */
export function getAllProjects(): ProjectConfig[] {
  return Object.values(projects)
}
