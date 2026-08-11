import type { NextConfig } from 'next'

/**
 * Two build modes:
 *
 *   (default)            output: 'standalone' — the Docker image used by Azure Container Apps
 *   NEXT_OUTPUT=export   output: 'export'     — plain HTML/CSS/JS for a static web server
 *                                               (ZID webspace); no Node runtime required
 *
 * NEXT_BASE_PATH serves the app from a subdirectory (e.g. '/hexgig-test'). Leave it unset
 * when the app is served from the root of its own vHost.
 *
 * Image optimisation is disabled only in export mode — it needs the Next.js server, and
 * turning it off globally would silently degrade the container-hosted builds.
 */
const isExport = process.env.NEXT_OUTPUT === 'export'

const nextConfig: NextConfig = {
  devIndicators: false,
  output: isExport ? 'export' : 'standalone',
  ...(isExport ? { images: { unoptimized: true } } : {}),
  ...(process.env.NEXT_BASE_PATH
    ? { basePath: process.env.NEXT_BASE_PATH }
    : {})
}

export default nextConfig
