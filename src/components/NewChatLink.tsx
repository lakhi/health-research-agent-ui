'use client'

import Link from 'next/link'

import Icon from '@/components/ui/icon'
import { type Locale } from '@/config/projects'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

const COPY: Record<Locale, { label: string; newTab: string }> = {
  en: { label: 'New chat', newTab: ' (opens in a new tab)' },
  de: { label: 'Neuer Chat', newTab: ' (öffnet in einem neuen Tab)' }
}

/**
 * Opens a fresh copy of the app in a new tab (refs #17). Chats aren't persisted, so
 * starting over in place would throw the current thread away; a new tab keeps it.
 *
 * Links to the app's own root rather than a fixed URL: next/link adds the basePath, so
 * production opens its own homepage while a staging build (`BASE_PATH=/hexgig-test`) or
 * `pnpm dev` stays on itself. A real link rather than a button, so middle-click and
 * long-press work and screen readers announce it as navigation. ChatHeader decides
 * when it shows.
 */
export function NewChatLink({ className }: { className?: string }) {
  const [locale] = useLocale()
  const copy = COPY[locale]

  return (
    <Link
      // Someone who switched the welcome screen to German gets German again in the new tab
      href={locale === 'de' ? '/?lang=de' : '/'}
      target="_blank"
      rel="noopener noreferrer"
      // Always opens a new tab, so warming this tab's router cache would be wasted
      prefetch={false}
      lang={locale}
      className={cn('flex items-center gap-1.5', className)}
    >
      <span aria-hidden="true" className="flex">
        <Icon
          type="square-pen"
          size="default"
          color="accent"
          className="size-3.5"
        />
      </span>
      {copy.label}
      <span aria-hidden="true" className="flex">
        <Icon
          type="arrow-up-right"
          size="default"
          color="accent"
          className="size-3"
        />
      </span>
      <span className="sr-only">{copy.newTab}</span>
    </Link>
  )
}
