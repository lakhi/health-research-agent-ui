import { useQueryState, parseAsString } from 'nuqs'

import { getProjectConfig } from '@/config/projects'

// Stable, module-level parser so all `agent` hook instances share one serializer/default
// (nuqs requires consistency across instances of the same key). withDefault makes reads
// return the project's default agent id synchronously; nuqs v2 clearOnDefault:true strips
// the param when the default is written. History is NOT baked in — callers that need a
// history entry pass it per-update: setAgentId(value, { history: 'push' }).
const agentParser = parseAsString.withDefault(
  getProjectConfig().defaultAgentId ?? ''
)

export function useAgentId() {
  return useQueryState('agent', agentParser)
}
