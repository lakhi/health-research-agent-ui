import { useQueryState, parseAsStringLiteral } from 'nuqs'

import { getProjectConfig, type Locale } from '@/config/projects'

// Stable, module-level parser so all `lang` hook instances share one serializer/default
// (nuqs requires consistency across instances of the same key). EN is the default face,
// so nuqs v2 clearOnDefault keeps it out of the URL; DE is linkable as `?lang=de`.
const localeParser = parseAsStringLiteral<Locale>(['en', 'de']).withDefault(
  'en'
)

/** Whether this project has German welcome copy — vax doesn't, so it gets no toggle */
export const hasGerman = !!getProjectConfig().de

export function useLocale() {
  const [locale, setLocale] = useQueryState('lang', localeParser)
  // Projects without German copy (vax) ignore `?lang=de`
  return [hasGerman ? locale : 'en', setLocale] as const
}
