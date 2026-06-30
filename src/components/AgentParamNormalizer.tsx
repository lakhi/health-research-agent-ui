'use client'

import { useEffect } from 'react'

import { getProjectConfig } from '@/config/projects'
import { useAgentId } from '@/hooks/useAgentId'

/**
 * Keeps the address bar clean for the project's default agent.
 *
 * When a `?agent=<id>` param is present and `<id>` equals the project's configured
 * `defaultAgentId`, this removes it on load (nuqs clearOnDefault). A non-default id
 * (a different/stale agent, or any id on projects without a default) is left untouched.
 *
 * This mounts independently of the Sidebar — which owns initialize() and is absent in
 * sidebar-disabled deployments — so the normalisation runs in every deployment.
 * Renders nothing.
 */
export function AgentParamNormalizer() {
  const { defaultAgentId } = getProjectConfig()
  const [agentId, setAgentId] = useAgentId()

  useEffect(() => {
    if (defaultAgentId && agentId === defaultAgentId) {
      setAgentId(null)
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
