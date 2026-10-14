#!/usr/bin/env node
/**
 * Mobile horizontal-overflow guard (refs #7).
 *
 * The chat column is a chain of flex items, and flex items default to
 * `min-width: auto` — they refuse to shrink below their content's min-content
 * width. Anything unbreakable inside (a `whitespace-nowrap` title, a cited URL,
 * a long code line) therefore widens *every ancestor* past the viewport. Mobile
 * Chrome responds by scaling the page down, which both clips text horizontally
 * and makes `100dvh` cover only part of the screen — the whitespace band at the
 * bottom of the app.
 *
 * Agent responses are unbounded, so this cannot be fixed once and forgotten.
 * This script loads each project build at phone widths and fails if the
 * document is wider than the viewport, naming the elements responsible.
 *
 * No dependencies: it drives the locally installed Chrome over CDP using
 * Node's built-in WebSocket (Node >= 22).
 *
 * Usage:
 *   node scripts/check-mobile-width.mjs                 # all projects
 *   node scripts/check-mobile-width.mjs hex-gig         # one project
 *   KEEP_OPEN=1 node scripts/check-mobile-width.mjs     # leave Chrome running
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PROJECTS = ['hex-gig', 'vax-study-chatbot', 'ssc-psych-chatbot']

/** Widths worth guarding: iPhone SE / small Android, Android, iPhone Pro. */
const WIDTHS = [320, 360, 390]

/**
 * `/` is the real app on its blank state. `/dev-mobile-check` is a dev-only
 * fixture that renders the genuine ChatBlankState and MarkdownRenderer against
 * content designed to break a narrow viewport — long cited URLs, an unbroken
 * German compound, a wide code block and a wide table — under the mid-chat
 * header (the New chat link).
 */
const PAGES = [
  ['blank state', '/'],
  // German welcome copy (refs #16); projects without it ignore the param
  ['blank state (DE)', '/?lang=de'],
  ['agent answer', '/dev-mobile-check']
]

const PORT = Number(process.env.CDP_PORT || 9333)
const BASE_PORT = Number(process.env.PORT || 3210)

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const findChrome = () => {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!found) {
    console.error(
      'Could not find Chrome. Set CHROME_PATH to the browser executable.'
    )
    process.exit(2)
  }
  return found
}

const waitFor = async (fn, { timeout = 30_000, interval = 250, label }) => {
  const deadline = Date.now() + timeout
  for (;;) {
    try {
      const value = await fn()
      if (value) return value
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${label}`)
    await sleep(interval)
  }
}

/** Minimal CDP client over a single page target. */
const connect = async () => {
  const targets = await (
    await fetch(`http://127.0.0.1:${PORT}/json/list`)
  ).json()
  const page = targets.find((t) => t.type === 'page')
  if (!page) throw new Error('No page target')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  let id = 0
  const pending = new Map()
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    const entry = pending.get(msg.id)
    if (!entry) return
    pending.delete(msg.id)
    msg.error
      ? entry.reject(new Error(JSON.stringify(msg.error)))
      : entry.resolve(msg.result)
  }

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const myId = ++id
      pending.set(myId, { resolve, reject })
      ws.send(JSON.stringify({ id: myId, method, params }))
    })

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    })
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails))
    return r.result.value
  }

  await send('Page.enable')
  await send('Runtime.enable')
  return { send, evaluate, close: () => ws.close() }
}

/**
 * Runs in the page and reports horizontal overflow anywhere in the layout.
 *
 * Measuring `documentElement.scrollWidth` alone is not enough. Two things in
 * this app absorb overflow before it reaches the document, while the text stays
 * just as clipped on screen:
 *
 *   - the message area is a scroll container (`use-stick-to-bottom` sets
 *     `overflow-y: auto`, which forces `overflow-x` to `auto` too), so content
 *     wider than the column scrolls sideways inside it, and
 *   - the app shell carries `overflow-x: clip` as a last-resort backstop.
 *
 * So: lift the backstop, then flag any element whose scrollable width exceeds
 * its client width. Blocks that are *deliberately* side-scrollable (`<pre>` and
 * the table wrapper, both marked with `overflow-x-auto`) are excluded — they
 * contain their own overflow by design and never widen an ancestor. So is
 * `.sr-only` screen-reader text: a 1px clipped, absolutely positioned box whose
 * text overflows it on purpose and can't push the layout.
 */
const MEASURE = `
(() => {
  const shell = document.querySelector('.overflow-x-clip')
  const restore = shell ? shell.style.overflowX : null
  if (shell) shell.style.overflowX = 'visible'
  void document.documentElement.offsetWidth // force reflow

  const vw = document.documentElement.clientWidth
  const intentional = (el) =>
    el.closest('pre, .overflow-x-auto, .sr-only') !== null

  const overflowing = new Set()
  for (const el of document.querySelectorAll('body, body *')) {
    if (el.clientWidth <= 0) continue
    if (el.scrollWidth <= el.clientWidth + 1) continue
    if (intentional(el)) continue
    overflowing.add(el)
  }

  // Overflow propagates up through visible-overflow ancestors, so most of the
  // set is collateral. Only the innermost elements name the real culprit.
  const innermost = [...overflowing].filter(
    (el) => ![...overflowing].some((other) => other !== el && el.contains(other))
  )

  const worst = [...overflowing].reduce(
    (max, el) => Math.max(max, el.scrollWidth - el.clientWidth), 0
  )
  const describe = (el) =>
    el.tagName.toLowerCase() +
    (el.getAttribute('class')
      ? '.' + el.getAttribute('class').trim().split(/\\s+/).slice(0, 6).join('.')
      : '') +
    '  (content ' + el.scrollWidth + 'px in a ' + el.clientWidth + 'px box)'

  if (shell) shell.style.overflowX = restore
  return JSON.stringify({
    vw,
    docScrollW: document.documentElement.scrollWidth,
    overflowPx: worst,
    offenders: innermost.slice(0, 6).map(describe)
  })
})()
`

const run = async () => {
  const only = process.argv[2]
  const projects = only ? [only] : PROJECTS
  if (only && !PROJECTS.includes(only)) {
    console.error(
      `Unknown project "${only}". Expected one of: ${PROJECTS.join(', ')}`
    )
    process.exit(2)
  }

  const chromePath = findChrome()
  const profile = mkdtempSync(join(tmpdir(), 'mobile-width-'))
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank'
    ],
    { stdio: 'ignore' }
  )

  const failures = []
  let cdp

  try {
    await waitFor(() => fetch(`http://127.0.0.1:${PORT}/json/version`), {
      label: 'Chrome DevTools endpoint'
    })
    cdp = await connect()

    for (const project of projects) {
      const port = BASE_PORT + PROJECTS.indexOf(project)
      const url = `http://localhost:${port}`
      const server = spawn(
        'pnpm',
        ['exec', 'next', 'dev', '--port', String(port)],
        {
          env: {
            ...process.env,
            NEXT_PUBLIC_PROJECT_ID: project,
            NEXT_PUBLIC_SIDEBAR_VIEW_ACCESS: 'false'
          },
          stdio: 'ignore',
          // Own process group, so cleanup can signal the whole chain. With
          // `packageManager` pinned, pnpm relaunches the pinned version as a
          // child and doesn't forward SIGTERM — killing only the top pid left
          // `next dev` running, which held the port and kept this script alive.
          detached: true
        }
      )

      try {
        await waitFor(() => fetch(url).then((r) => r.ok), {
          label: `${project} dev server`,
          timeout: 90_000
        })

        for (const width of WIDTHS) {
          await cdp.send('Emulation.setDeviceMetricsOverride', {
            width,
            height: 780,
            deviceScaleFactor: 2,
            mobile: true
          })

          for (const [state, path] of PAGES) {
            await cdp.send('Page.navigate', { url: url + path })
            await sleep(4000)
            const { vw, docScrollW, overflowPx, offenders } = JSON.parse(
              await cdp.evaluate(MEASURE)
            )
            const label = `${project} @ ${width}px — ${state}`
            if (overflowPx > 0 || docScrollW > vw) {
              failures.push({ label, vw, docScrollW, overflowPx, offenders })
              console.log(
                `  ✗ ${label}: ${overflowPx}px of horizontal overflow`
              )
            } else {
              console.log(`  ✓ ${label}`)
            }
          }
        }
      } finally {
        try {
          process.kill(-server.pid, 'SIGTERM')
        } catch {
          /* group already gone */
        }
      }
    }
  } finally {
    cdp?.close()
    if (!process.env.KEEP_OPEN) {
      chrome.kill('SIGTERM')
      // Chrome keeps writing to the profile until it exits; removing it first
      // races and throws ENOTEMPTY.
      await Promise.race([
        new Promise((r) => chrome.once('exit', r)),
        sleep(5000)
      ])
      try {
        rmSync(profile, { recursive: true, force: true })
      } catch {
        /* a leftover temp profile is harmless */
      }
    }
  }

  if (failures.length) {
    console.error(
      '\nHorizontal overflow detected — the page will clip text and zoom out on phones.\n'
    )
    for (const f of failures) {
      console.error(
        `${f.label}: viewport ${f.vw}px, overflow ${f.overflowPx}px` +
          (f.docScrollW > f.vw ? ` (document ${f.docScrollW}px)` : '')
      )
      for (const o of f.offenders) console.error(`    ${o}`)
    }
    console.error(
      '\nUsual cause: a flex item whose min-content width exceeds the viewport.' +
        '\nFixes: add `min-w-0` to the flex chain, `break-words` / `[overflow-wrap:anywhere]`' +
        '\nto text that can contain long tokens, `overflow-x-auto` to wide blocks,' +
        '\nand avoid `whitespace-nowrap` on anything holding project copy.'
    )
    process.exit(1)
  }

  console.log('\nNo horizontal overflow at any tested width.')
}

run().catch((err) => {
  console.error(err)
  process.exit(2)
})
