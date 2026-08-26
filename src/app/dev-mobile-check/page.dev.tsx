'use client'

import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import ChatBlankState from '@/components/chat/ChatArea/Messages/ChatBlankState'

/**
 * Development-only fixture for `scripts/check-mobile-width.mjs` (refs #7).
 *
 * The overflow bugs this guards against live in the *components* — the blank
 * state's title, the markdown renderer's wrapping rules, the `<pre>` and table
 * overrides. Injecting look-alike HTML into the real page would test the
 * fixture instead of the code, so the check renders the genuine components
 * against content chosen to be maximally hostile to a narrow viewport.
 *
 * The `.dev.tsx` extension is only routable in development (see `pageExtensions`
 * in next.config.ts), so this never reaches a production build at all.
 */
const STRESS_MARKDOWN = `
Das Masterstudium Psychologie gliedert sich in mehrere Module mit
unterschiedlichen Schwerpunkten.

1. **Applied Module:** Practical skills and methods in psychotherapy
2. **Research Module:** Scientific methods, research projects, and master's thesis

A long unbroken compound word:
Rechtsschutzversicherungsgesellschaftsangestelltenvertretung

A cited source URL, the shape that actually breaks production layouts:
https://ssc-psychologie.univie.ac.at/studium/masterstudium-psychologie/zulassung-und-aufnahmeverfahren/

And one as a labelled link:
[Zulassung und Aufnahmeverfahren](https://ssc-psychologie.univie.ac.at/studium/bachelorstudium-psychologie/zulassung-und-aufnahmeverfahren/)

A wide code block:

\`\`\`ts
const response = await fetch('https://example.org/a/very/long/path/that/never/wraps?with=query&and=more')
\`\`\`

A wide table:

| Modul | Beschreibung | ECTS | Voraussetzung |
| --- | --- | --- | --- |
| Grundlagenmodul | Allgemeine Psychologie und Methodenlehre | 30 | Bachelorabschluss |
| Anwendungsmodul | Klinische Psychologie und Psychotherapieforschung | 25 | Grundlagenmodul |
`

export default function MobileCheckFixture() {
  return (
    <main className="relative m-1.5 flex min-w-0 flex-grow flex-col rounded-xl bg-background">
      <div className="relative mb-4 flex min-h-0 w-full min-w-0 flex-grow flex-col overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-2xl space-y-9 px-4 pb-4">
          <ChatBlankState />
          <div className="flex w-full min-w-0 flex-row items-start gap-4 font-primary">
            <div className="flex-shrink-0">
              <div className="size-6" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <MarkdownRenderer>{STRESS_MARKDOWN}</MarkdownRenderer>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
