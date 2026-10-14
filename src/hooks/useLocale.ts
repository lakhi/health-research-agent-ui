import { useQueryState, parseAsStringLiteral } from 'nuqs'

import {
  getProjectConfig,
  type Locale,
  type LocalizedCopy
} from '@/config/projects'

// Stable, module-level parser so all `lang` hook instances share one serializer/default
// (nuqs requires consistency across instances of the same key). EN is the default face,
// so nuqs v2 clearOnDefault keeps it out of the URL; DE is linkable as `?lang=de`.
const localeParser = parseAsStringLiteral<Locale>(['en', 'de']).withDefault(
  'en'
)

const projectConfig = getProjectConfig()

/** Whether this project has German copy — vax doesn't, so it gets no toggle */
export const hasGerman = !!projectConfig.de

/**
 * One project copy field in the given language. A field missing from the German
 * copy falls back to English instead of vanishing (a dropped privacy notice would
 * otherwise go unnoticed); `lang` says which one it is, so screen readers stay right.
 */
export const localized = <K extends keyof LocalizedCopy>(
  key: K,
  locale: Locale
): { text: LocalizedCopy[K]; lang: Locale } => {
  const german = locale === 'de' ? projectConfig.de?.[key] : undefined
  return german
    ? { text: german, lang: 'de' }
    : { text: projectConfig[key], lang: 'en' }
}

export function useLocale() {
  const [locale, setLocale] = useQueryState('lang', localeParser)
  // Projects without German copy (vax) ignore `?lang=de`
  return [hasGerman ? locale : 'en', setLocale] as const
}
