'use client'

import { type Locale } from '@/config/projects'
import { useLocale } from '@/hooks/useLocale'

// Each button is labelled in the language it switches *to*
const TARGET: Record<Locale, { locale: Locale; label: string; name: string }> =
  {
    en: { locale: 'de', label: 'DE', name: 'Deutsch' },
    de: { locale: 'en', label: 'EN', name: 'English' }
  }

/**
 * EN/DE switch for the welcome screen (refs #16).
 *
 * Only the blank-state copy is translated, so ChatHeader shows the toggle only for
 * projects with German copy and only until the first message — mid-chat it would
 * change nothing visible.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const [locale, setLocale] = useLocale()
  const target = TARGET[locale]

  return (
    <button
      type="button"
      lang={target.locale}
      aria-label={target.name}
      onClick={() => setLocale(target.locale)}
      className={className}
    >
      {target.label}
    </button>
  )
}
