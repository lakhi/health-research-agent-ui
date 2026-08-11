#!/usr/bin/env bash
#
# publish-static.sh — build the HeX-GiG static export, package it, and publish it to the
# rolling `hexgig-static-latest` GitHub release. Prints the one-line command to paste into
# the ZID OpenShift pod Terminal.
#
# Pull-based deploy: the OpenShift API and SFTP are firewalled, so the pod fetches the
# build from GitHub rather than us pushing to it. Mirrors the StatsBot deploy pattern.
#
#   BASE_PATH=/hexgig-test bash scripts/publish-static.sh
set -euo pipefail

REPO="lakhi/health-research-agent-ui"
TAG="hexgig-static-latest"
ASSET="hexgig-static.tgz"
BUILD_OUT="out"
NAMESPACE="lehrprojeg67"
PODS_LIST="https://console-openshift-console.web.univie.ac.at/k8s/ns/${NAMESPACE}/pods"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# --- build (all gates live in build-static.sh; it exits non-zero on any problem) -------
bash scripts/build-static.sh

# --- package (strip macOS xattrs so the container's tar stays quiet) -------------------
work="$(mktemp -d)"
tgz="$work/$ASSET"
COPYFILE_DISABLE=1 tar --no-mac-metadata -czf "$tgz" -C "$BUILD_OUT" . 2>/dev/null \
  || tar -czf "$tgz" -C "$BUILD_OUT" .
sha="$(shasum -a 256 "$tgz" | awk '{print $1}')"
echo "$sha  $ASSET" > "$tgz.sha256"
echo "==> Packaged $ASSET — sha256: $sha"

# --- publish: create the rolling release if missing, then clobber the asset ------------
if ! gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  echo "==> Creating rolling release '$TAG'…"
  gh release create "$TAG" --repo "$REPO" --title "HeX-GiG static export (rolling latest)" \
    --notes "Rolling static export of the HeX-GiG UI for hosting on a ZID webspace. Asset is replaced on each publish by scripts/publish-static.sh."
fi
echo "==> Uploading asset (clobber)…"
gh release upload "$TAG" "$tgz" "$tgz.sha256" --repo "$REPO" --clobber

cat <<EOF

────────────────────────────────────────────────────────────
✅ Published build  $sha  to release '$TAG'.

NEXT — apply it on the webspace pod (you approve this live write):
  1. Open the pods list (U:Wien network or VPN):
       $PODS_LIST
     Click the running zid-webproject-… pod → "Terminal" tab.

  2. One-time only — fetch the deploy script into /var/www/:
       curl -fsSL https://raw.githubusercontent.com/${REPO}/main/scripts/webspace-deploy-hexgig.sh -o /var/www/webspace-deploy-hexgig.sh

  3. Paste this single line:

       EXPECT=$sha bash /var/www/webspace-deploy-hexgig.sh

  4. Open in a PRIVATE window (the app persists its endpoint in localStorage):
       https://statsbot.univie.ac.at/hexgig-test/

  5. Teardown when the test is done:
       rm -rf /var/www/html/hexgig-test
────────────────────────────────────────────────────────────
EOF
