import { getProjectConfig } from './projects'

/**
 * Get the default API endpoint for the current project
 *
 * Priority:
 * 1. NEXT_PUBLIC_API_ENDPOINT environment variable (set at build time or runtime)
 * 2. Project configuration based on NEXT_PUBLIC_PROJECT_ID
 *
 * This replaces the old hardcoded fallback and NEXT_PUBLIC_BACKEND_API_ENDPOINT
 */
export function getDefaultEndpoint(): string {
  // First priority: explicit environment variable
  const envEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  if (envEndpoint) {
    return envEndpoint
  }

  // Second priority: project configuration
  const projectConfig = getProjectConfig()
  return projectConfig.apiEndpoint
}
