#!/usr/bin/env bash
#
# build-static.sh — produce a static export of the UI (plain HTML/CSS/JS) that can be
# served by an ordinary web server such as the ZID webspace. No Node runtime is needed
# at serve time; the app calls its backend API directly from the browser.
#
#   bash scripts/build-static.sh                       # hex-gig, served from a vHost root
#   BASE_PATH=/hexgig-test bash scripts/build-static.sh # served from a subdirectory
#
# Every NEXT_PUBLIC_* input is pinned on the command line. Next.js gives environment
# variables precedence over .env files, so this build is immune to whichever project
# happens to be selected in a developer's .env.local — a real failure mode: an earlier
# export silently baked in .env.local's http://localhost:8000 and would have shipped an
# app that could not reach its API.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-hex-gig}"
API_ENDPOINT="${API_ENDPOINT:-https://hex-gig-agent-api.bravemeadow-0cb4208f.swedencentral.azurecontainerapps.io}"
BASE_PATH="${BASE_PATH:-}"
SIDEBAR="${SIDEBAR_VIEW_ACCESS:-false}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Static export"
echo "    project      : $PROJECT_ID"
echo "    API endpoint : $API_ENDPOINT"
echo "    base path    : ${BASE_PATH:-<none, served from root>}"

echo "==> Installing dependencies (frozen lockfile)…"
pnpm install --frozen-lockfile

echo "==> Cleaning previous export…"
rm -rf out .next

echo "==> Building…"
NEXT_OUTPUT=export \
NEXT_BASE_PATH="$BASE_PATH" \
NEXT_PUBLIC_PROJECT_ID="$PROJECT_ID" \
NEXT_PUBLIC_API_ENDPOINT="$API_ENDPOINT" \
NEXT_PUBLIC_SIDEBAR_VIEW_ACCESS="$SIDEBAR" \
  pnpm build

# ---------------------------------------------------------------------------
# Gates. A static export hard-fails the build on any server-dependent feature,
# so reaching this point already proves the app needs no server runtime. What
# remains to verify is that the *right values* were compiled in.
# ---------------------------------------------------------------------------
echo "==> Verifying export…"

[ -f out/index.html ] || { echo "ERROR: out/index.html missing — export failed?" >&2; exit 1; }

# 1. The endpoint the app will call must be present.
grep -rqF "$API_ENDPOINT" out/ \
  || { echo "ERROR: API endpoint '$API_ENDPOINT' not found in the export." >&2; exit 1; }

# 2. The .env.local development endpoint must NOT have leaked in. (Bare 'localhost' and
#    'localhost:7777' appear legitimately as placeholder/helper strings — only this exact
#    value indicates .env.local won.)
if grep -rqF "http://localhost:8000" out/; then
  echo "ERROR: development endpoint http://localhost:8000 leaked into the export." >&2
  echo "       An ambient NEXT_PUBLIC_API_ENDPOINT overrode the pinned value." >&2
  exit 1
fi

# 3. Report the endpoint actually compiled into the store initialiser, when the minified
#    shape is recognisable. Informational: gates 1 and 2 are the binding checks.
baked="$(grep -rhoE 'selectedEndpoint:function\(\)\{let [A-Za-z_$]+="[^"]*"' out/_next/static/chunks/ 2>/dev/null \
         | grep -oE '"[^"]*"$' | tr -d '"' | head -1 || true)"
if [ -n "$baked" ]; then
  echo "    compiled default endpoint: $baked"
else
  echo "    (could not read the compiled endpoint — minified shape changed; gates 1+2 still applied)"
fi

# 4. Assets must resolve under the configured base path.
if [ -n "$BASE_PATH" ]; then
  grep -qF "${BASE_PATH}/_next/" out/index.html \
    || { echo "ERROR: index.html does not reference assets under $BASE_PATH — basePath not applied." >&2; exit 1; }
  echo "    assets referenced under $BASE_PATH ✓"
fi

echo "==> Export OK — $(du -sh out | awk '{print $1}') in out/"
