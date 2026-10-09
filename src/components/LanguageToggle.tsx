'use client'

import { type Locale } from '@/config/projects'
import { hasGerman, useLocale } from '@/hooks/useLocale'
import { useStore } from '@/store'

// Each button is labelled in the language it switches *to*
const TARGET: Record<Locale, { locale: Locale; label: string; name: string }> =
  {
    en: { locale: 'de', label: 'DE', name: 'Deutsch' },
    de: { locale: 'en', label: 'EN', name: 'English' }
  }

/**
 * EN/DE switch for the welcome screen (refs #16).
 *
 * Only the blank-state copy is translated, so the toggle shows only for projects
 * with German copy and only until the first message — mid-chat it would change
 * nothing visible. It sits in its own row rather than floating over the column,
 * so a tall welcome text on a short phone screen can never slide under it.
 */
export function LanguageToggle() {
  const [locale, setLocale] = useLocale()
  const isBlankState = useStore((s) => s.messages.length === 0)

  if (!hasGerman || !isBlankState) return null

  const target = TARGET[locale]

  return (
    <div className="flex justify-end px-3 pt-3">
      <button
        type="button"
        lang={target.locale}
        aria-label={target.name}
        onClick={() => setLocale(target.locale)}
        className="rounded-full border border-accent/40 px-3 py-1 font-primary text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {target.label}
      </button>
    </div>
  )
}
