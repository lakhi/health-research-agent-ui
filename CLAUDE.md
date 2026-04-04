# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js 15 (App Router) — TypeScript, React 18
- **Styling**: Tailwind CSS with CSS custom properties; theme switching via `data-project` attribute on `<html>`
- **State**: Zustand (persisted to localStorage — clear if store shape changes)
- **Package manager**: pnpm

## Multi-Project Setup

This repo builds 3 distinct chatbot UIs from a single codebase, selected at **build time** via `NEXT_PUBLIC_PROJECT_ID`:

| Project ID          | Theme      |
| ------------------- | ---------- |
| `nex`               | Blue/white |
| `vax-study-chatbot` | Orange     |
| `ssc-psych-chatbot` | Orange     |

Per-project config (API endpoint, metadata, theme colors) lives in `src/config/projects.ts`. CSS variables are defined in `src/app/globals.css` and scoped with `[data-project='nex']` selectors. **Cannot switch projects at runtime** — it's a build-time arg.

## Local Development

Create `.env.local`:

```
NEXT_PUBLIC_PROJECT_ID=nex
```

Valid values: `nex`, `vax-study-chatbot`, `ssc-psych-chatbot`. Then run `pnpm dev` (port 3000).

## Code Style

Prettier enforces: **single quotes, no semicolons, no trailing commas**, Tailwind class sorting (via `prettier-plugin-tailwindcss`). Config in `prettier.config.cjs`.

TypeScript strict mode is on. Use the `@/*` path alias (`→ ./src/*`) for all internal imports.

## Key Commands

```bash
pnpm dev          # dev server on port 3000
pnpm build        # production build
pnpm lint:fix     # ESLint auto-fix
pnpm format:fix   # Prettier write
pnpm typecheck    # tsc --noEmit
pnpm validate     # lint + format check + typecheck (run before marking work done)
```

## Deployment

- Build output is `standalone` (Docker multi-stage, `node:18-alpine`)
- Each project has its own GitHub Actions workflow deploying to Azure Container Registry + Container Apps
- `NEXT_PUBLIC_PROJECT_ID` is passed as a Docker `--build-arg` — set per workflow

## Testing

No test framework is configured. `pnpm validate` is the primary correctness check.

## Git Workflow

Always push directly to `main` unless explicitly told to use a different branch. Do not create feature branches by default.
