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

export type ProjectId =
  | 'healthsoc-network-chatbot'
  | 'vax-study-chatbot'
  | 'ssc-psych-chatbot'

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

export interface ProjectConfig {
  id: ProjectId
  name: string
  description: string
  apiEndpoint: string
  theme: ProjectTheme
  metadata: {
    title: string
    description: string
  }
}

const projects: Record<ProjectId, ProjectConfig> = {
  'healthsoc-network-chatbot': {
    id: 'healthsoc-network-chatbot',
    name: 'Health in Society Research Network Chatbot',
    description:
      'Discover the members at the Health Research Network, and explore their research interests!',
    apiEndpoint:
      'https://health-research-api.niceground-23078755.westeurope.azurecontainerapps.io/',
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
        primary: 'Inter',
        mono: 'DM Mono'
      }
    },
    metadata: {
      title: 'Health in Society Research Network Chatbot',
      description:
        'Discover the members at the Health Research Network, and explore their research interests!'
    }
  },
  'vax-study-chatbot': {
    id: 'vax-study-chatbot',
    name: 'Research Studies Chatbot',
    description:
      'Hello! Im a Chatbot designed to help you understand the marhinovirus and its vaccination. I am also here to help you with the choice to either vaccinate or not. Ask me anything you want. If you don’t know where to start, just ask me “what is the marhinovirus?”',
    apiEndpoint:
      'https://marhinovirus-study-api.whitedesert-10483e06.westeurope.azurecontainerapps.io',
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
        primary: 'Open Sans',
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
    name: 'SSC Psychology Chatbot',
    description:
      'Your intelligent assistant for psychology resources at the SSC (Student Service Center). Get help with study materials, research guidance, and academic support.',
    apiEndpoint: '', // To be configured when SSC project is deployed
    theme: {
      colors: {
        brand: '#FF4017', // Orange (same as vax-study)
        primary: '#FAFAFA',
        primaryAccent: '#18181B',
        background: {
          default: '#111113',
          secondary: '#27272A'
        },
        secondary: '#F5F5F5',
        accent: '#27272A',
        muted: '#A1A1AA',
        destructive: '#E53935',
        positive: '#22C55E'
      },
      fonts: {
        primary: 'Geist',
        mono: 'DM Mono'
      }
    },
    metadata: {
      title: 'SSC Psychology Chatbot',
      description:
        'AI assistant for psychology resources and academic support at the Student Service Center'
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
