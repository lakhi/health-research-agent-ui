---
name: validate
description: Run full validation (lint + format check + typecheck) via pnpm validate. Use before marking any implementation task as done.
---

Run the full validation suite:

```bash
pnpm validate
```

This runs `pnpm lint && pnpm format && pnpm typecheck` in sequence.

- If lint fails: run `pnpm lint:fix` then re-validate
- If format fails: run `pnpm format:fix` then re-validate
- If typecheck fails: fix TypeScript errors manually

Report the result back to the user. If everything passes, confirm it's ready to review.
