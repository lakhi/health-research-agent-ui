---
name: sync-upstream
description: Sync changes from the upstream agno-agi/agent-ui repo into this fork. Surfaces all missing commits, categorizes them by type (security, feature, chore), and guides applying selected changes safely.
---

Check for upstream changes and selectively integrate them into this fork.

## Step 1 — Fetch and surface missing commits

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
```

Show the output to the user. Categorize each commit:

- **Security/CVE** — message contains "CVE", "vulnerability", "security", or "fix: upgrade"
- **Feature** — message starts with "feat"
- **Chore/maintenance** — message starts with "chore", "refactor", "docs", or "ci"

## Step 2 — Inspect relevant commits

For each commit the user wants to apply, fetch its diff from GitHub:

```
https://github.com/agno-agi/agent-ui/commit/<hash>
```

Identify what changed: is it a package.json version bump, a code change, or a config update?

## Step 3 — Apply changes

**For package.json version bumps (most CVE fixes):**

- Edit `package.json` to update the version(s)
- Run `pnpm install` to regenerate the lockfile
- Do NOT manually edit `pnpm-lock.yaml`

**For code changes:**

- Apply the diff manually, respecting our fork's customizations (project config, theming, branding in `src/config/projects.ts`, `src/app/globals.css`, etc.)
- Be careful not to overwrite fork-specific changes

## Step 4 — Validate

```bash
pnpm validate
```

If format fails, run `pnpm format:fix` then re-validate.
If lint fails, run `pnpm lint:fix` then re-validate.
If typecheck fails, fix TypeScript errors manually.

## Step 5 — Commit

Suggest a commit message in the format:

```
fix: sync upstream changes from agno-agi/agent-ui

- <short description of each applied change>

Closes #<issue number if applicable>
```

Remind the user to push with `git push origin main` after confirming.

## Notes

- This repo's `upstream` remote points to `https://github.com/agno-agi/agent-ui.git`
- Our fork has significant divergence (custom theming, multi-project config, Azure deployment) — never do a blind `git merge upstream/main`
- Prioritize security commits; apply feature commits only after reviewing for conflicts with our customizations
