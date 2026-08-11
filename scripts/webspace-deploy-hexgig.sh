#!/usr/bin/env bash
#
# webspace-deploy-hexgig.sh — runs INSIDE a ZID OpenShift webspace container.
#
# Pulls the published HeX-GiG static export from a GitHub release and applies it to a
# SUBDIRECTORY of the docroot. This is a feasibility test running on a webspace whose
# root serves a different, live application, so the script is deliberately confined:
#
#   * it only ever writes inside $SUBDIR (refuses to run if $SUBDIR is not under $DOCROOT)
#   * it backs up only $SUBDIR — never the docroot as a whole
#   * it never touches .htaccess, index.html, or anything else at the docroot root
#   * it is integrity-gated (sha256) and idempotent (re-running the same build is a no-op)
#
#   Apply:     EXPECT=<sha256> bash /var/www/webspace-deploy-hexgig.sh
#   Teardown:  rm -rf /var/www/html/hexgig-test
set -euo pipefail

REPO="lakhi/health-research-agent-ui"
TAG="hexgig-static-latest"
ASSET="hexgig-static.tgz"
DOCROOT="/var/www/html"
SUBDIR="$DOCROOT/hexgig-test"
STATE="/var/www/.deployed-sha-hexgig"
LOG="/var/www/deploy-hexgig.log"
KEEP_BACKUPS=3
BASE="https://github.com/${REPO}/releases/download/${TAG}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# --- containment guard: refuse to operate anywhere but inside the docroot -------------
case "$SUBDIR" in
  "$DOCROOT"/?*) : ;;
  *) echo "ABORT: refusing to deploy — '$SUBDIR' is not a subdirectory of '$DOCROOT'" >&2; exit 1 ;;
esac
[ "$SUBDIR" != "$DOCROOT" ] || { echo "ABORT: SUBDIR must not be the docroot itself" >&2; exit 1; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

log "=== hexgig deploy start (pod $(hostname)) -> $SUBDIR ==="

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

# 4. Back up only our own subdirectory (if it exists), prune to the last $KEEP_BACKUPS
if [ -d "$SUBDIR" ]; then
  ts="$(date '+%Y%m%d-%H%M%S')"
  backup="/var/www/hexgig-test-backup-${ts}.tgz"
  tar czf "$backup" -C "$DOCROOT" "$(basename "$SUBDIR")"
  log "backup created: $backup"
  backups=(/var/www/hexgig-test-backup-*.tgz)
  if [ -e "${backups[0]}" ]; then
    printf '%s\n' "${backups[@]}" | sort -r | tail -n +$((KEEP_BACKUPS+1)) | while read -r old; do
      rm -f "$old" && log "pruned old backup: $old"
    done
  fi
fi

# 5. Replace the subdirectory contents (fresh dir: stale hashed chunks must not linger)
rm -rf "$SUBDIR"
mkdir -p "$SUBDIR"
tar xzf "$tmp/$ASSET" -C "$SUBDIR" --warning=no-unknown-keyword
chmod -R ug+rwX "$SUBDIR"
log "extracted export into $SUBDIR"

# 6. Record state
echo "$got" > "$STATE"
log "=== hexgig deploy done (sha $got) — serving $SUBDIR ==="
