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

export interface ProjectConfig {
  id: ProjectId
  name: string
  description: string | React.ReactNode
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
  /** Short privacy reassurance shown as its own line under the description (blank state) */
  privacyNotice?: string | React.ReactNode
  /** Placeholder text for the chat input (defaults to 'Ask anything') */
  inputPlaceholder?: string
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
}

const projects: Record<ProjectId, ProjectConfig> = {
  'hex-gig': {
    id: 'hex-gig',
    name: "HeX-GiG (GiG's Health Explorer)",
    description: (
      <>
        HeX-GiG is an AI-powered knowledge assistant which captures the
        expertise of the Health in Society Research Network members through
        their{' '}
        <a
          href="https://ucloud.univie.ac.at/index.php/s/Aey6ydCDrBfigyX"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          publications in health
        </a>
        , and knows about the network&apos;s current{' '}
        <a
          href="https://gig.univie.ac.at/en/about-us/news"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          activities
        </a>
        !
      </>
    ),
    privacyNotice: (
      <>
        <strong>Your privacy comes first.</strong> We don&apos;t store your
        conversations and never ask who you are — so there&apos;s no need to
        share personal, sensitive, or confidential information.
      </>
    ),
    inputPlaceholder: 'What would you like to explore?',
    defaultAgentId: 'hex',
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
    apiEndpoint: '', // To be configured when SSC backend Container App is deployed
    defaultAgentId: 'ssc',
    privacyNotice: (
      <>
        <strong>Your privacy comes first.</strong> We don&apos;t store your
        conversations and never ask who you are — so there&apos;s no need to
        share personal, sensitive, or confidential information.
      </>
    ),
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
