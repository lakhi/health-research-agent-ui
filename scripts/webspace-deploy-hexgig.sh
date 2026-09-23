#!/usr/bin/env bash
#
# webspace-deploy-hexgig.sh — runs INSIDE the HeX-GiG ZID webspace pod (namespace hexg98).
#
# Publishes the static export at the docroot root: on this webspace the docroot IS the
# application, so the safety model differs from the earlier subdirectory-confined version
# that ran as a guest on someone else's webspace:
#
#   * DOCROOT is pinned — the script refuses to run against any other path
#   * the build is downloaded, sha256-verified and unpacked to a staging directory and
#     sanity-checked BEFORE anything is removed, so a bad build can never empty the site
#   * only the docroot's *contents* are removed, never the directory itself (the PVC is
#     mounted at /var/www, so /var/www/html must keep its identity and permissions)
#   * every deploy backs up the site it replaces; rollback is one documented command
#   * idempotent — re-running the same build is a no-op
#
# Everything it writes lives under /var/www, the only path that survives a pod restart.
#
#   Apply:     EXPECT=<sha256> bash /var/www/webspace-deploy-hexgig.sh
#   Rollback:  bash /var/www/webspace-deploy-hexgig.sh --rollback
set -euo pipefail

REPO="lakhi/health-research-agent-ui"
TAG="hexgig-static-latest"
ASSET="hexgig-static.tgz"
DOCROOT="/var/www/html"
STAGE="/var/www/.hexgig-staging"
STATE="/var/www/.deployed-sha-hexgig"
LOG="/var/www/deploy-hexgig.log"
BACKUP_GLOB="/var/www/hexgig-backup-*.tgz"
KEEP_BACKUPS=3
BASE="https://github.com/${REPO}/releases/download/${TAG}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# --- guard: the docroot is pinned -----------------------------------------------------
[ "$DOCROOT" = "/var/www/html" ] \
  || { echo "ABORT: DOCROOT '$DOCROOT' is not the expected /var/www/html" >&2; exit 1; }
[ -d "$DOCROOT" ] \
  || { echo "ABORT: docroot '$DOCROOT' does not exist" >&2; exit 1; }

# --- rollback mode --------------------------------------------------------------------
if [ "${1:-}" = "--rollback" ]; then
  latest="$(ls -1t $BACKUP_GLOB 2>/dev/null | head -1 || true)"
  [ -n "$latest" ] || { echo "ABORT: no backup found matching $BACKUP_GLOB" >&2; exit 1; }
  log "=== ROLLBACK to $latest ==="
  find "$DOCROOT" -mindepth 1 -delete
  tar xzf "$latest" -C "$DOCROOT" --warning=no-unknown-keyword
  chmod -R ug+rwX "$DOCROOT"
  rm -f "$STATE"          # force the next deploy to run even if the sha is unchanged
  log "=== rollback done — site restored from $latest ==="
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp" "$STAGE"' EXIT

log "=== hexgig deploy start (pod $(hostname)) -> $DOCROOT ==="

# 1. Download the published export
log "downloading ${BASE}/${ASSET}"
curl -fsSL "${BASE}/${ASSET}" -o "$tmp/$ASSET"

# 2. Integrity gate
got="$(sha256sum "$tmp/$ASSET" | awk '{print $1}')"
if [ -n "${EXPECT:-}" ]; then
  want="$EXPECT"; src="caller (EXPECT)"
else
  curl -fsSL "${BASE}/${ASSET}.sha256" -o "$tmp/$ASSET.sha256"
  want="$(awk '{print $1}' "$tmp/$ASSET.sha256")"; src="release .sha256"
fi
if [ "$got" != "$want" ]; then
  log "ABORT: sha256 mismatch — got $got, expected $want (from $src)"
  exit 1
fi
log "integrity OK ($src): $got"

# 3. Idempotency
if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$got" ]; then
  log "no change — build $got already deployed; exiting"
  exit 0
fi

# 4. Unpack to staging and validate BEFORE touching the live site.
#    This ordering is the point: a truncated or wrong-shaped archive fails here, while
#    the current site is still serving. Only a validated build reaches step 6.
rm -rf "$STAGE"; mkdir -p "$STAGE"
tar xzf "$tmp/$ASSET" -C "$STAGE" --warning=no-unknown-keyword
[ -f "$STAGE/index.html" ] || { log "ABORT: archive has no index.html — not a static export"; exit 1; }
[ -d "$STAGE/_next" ]     || { log "ABORT: archive has no _next/ directory — export incomplete"; exit 1; }
log "staged and validated: $(find "$STAGE" -type f | wc -l) files"

# 5. Back up the site being replaced, then prune to the last $KEEP_BACKUPS
if [ -n "$(ls -A "$DOCROOT" 2>/dev/null)" ]; then
  backup="/var/www/hexgig-backup-$(date '+%Y%m%d-%H%M%S').tgz"
  tar czf "$backup" -C "$DOCROOT" .
  log "backup created: $backup"
  ls -1t $BACKUP_GLOB 2>/dev/null | tail -n +$((KEEP_BACKUPS+1)) | while read -r old; do
    rm -f "$old" && log "pruned old backup: $old"
  done
fi

# 6. Swap: clear the docroot's CONTENTS (never the directory — it lives on the PVC mount
#    at /var/www) and move the validated build in. Stale hashed chunks must not linger.
#    Not `cp -a`: the PVC refuses chown with EACCES, which cp reports as an error, so
#    under `set -e` the script stopped here after copying. Ownership isn't needed —
#    the copies belong to the pod user, which is correct.
find "$DOCROOT" -mindepth 1 -delete
cp -R --preserve=mode,timestamps "$STAGE"/. "$DOCROOT"/
chmod -R ug+rwX "$DOCROOT"
log "published $(find "$DOCROOT" -type f | wc -l) files to $DOCROOT"

# 7. Record state
echo "$got" > "$STATE"
log "=== hexgig deploy done (sha $got) — live at https://hex-gig.univie.ac.at/ ==="
