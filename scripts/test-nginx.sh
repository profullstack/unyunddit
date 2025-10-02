#!/usr/bin/env bash
# Works in bash or zsh
# Tests an nginx config template that uses ${PORT} and ${NGINX_PORT} placeholders
# without overwriting your real config. Prints clear pass/fail output.

set -euo pipefail

# ---- Config ----
TEMPLATE_DEFAULT="$HOME/src/profullstack.com/unyunddit/docker/nginx.conf"
PORT_DEFAULT="${PORT:-8000}"
NGINX_PORT_DEFAULT="${NGINX_PORT:-8080}"

KEEP_TMP=0
TEMPLATE_PATH="$TEMPLATE_DEFAULT"
RUNTIME_PORT="$PORT_DEFAULT"
RUNTIME_NGINX_PORT="$NGINX_PORT_DEFAULT"

usage() {
  cat <<EOF
Usage: $(basename "$0") [-f TEMPLATE] [-p PORT] [-l NGINX_PORT] [-k]

  -f TEMPLATE     Path to nginx template (default: $TEMPLATE_DEFAULT)
  -p PORT         Upstream app port to substitute for \${PORT} (default: $PORT_DEFAULT)
  -l NGINX_PORT   Listen port to substitute for \${NGINX_PORT} (default: $NGINX_PORT_DEFAULT)
  -k              Keep rendered temp file for inspection (prints path)

Environment:
  PORT, NGINX_PORT can be set instead of -p/-l. CLI flags win.

Example:
  PORT=8000 NGINX_PORT=8080 $(basename "$0") -f "$TEMPLATE_DEFAULT"
EOF
}

# ---- Args ----
while getopts ":f:p:l:kh" opt; do
  case "$opt" in
    f) TEMPLATE_PATH="$OPTARG" ;;
    p) RUNTIME_PORT="$OPTARG" ;;
    l) RUNTIME_NGINX_PORT="$OPTARG" ;;
    k) KEEP_TMP=1 ;;
    h) usage; exit 0 ;;
    \?) echo "Unknown option: -$OPTARG" >&2; usage; exit 2 ;;
    :)  echo "Option -$OPTARG requires an argument." >&2; usage; exit 2 ;;
  esac
done

# ---- Checks ----
if ! command -v envsubst >/dev/null 2>&1; then
  echo "Error: envsubst not found. Install gettext (Arch: 'sudo pacman -S gettext', Debian/Ubuntu: 'sudo apt-get install gettext-base')." >&2
  exit 127
fi
if ! command -v nginx >/dev/null 2>&1; then
  echo "Error: nginx not found in PATH." >&2
  exit 127
fi
if [ ! -f "$TEMPLATE_PATH" ]; then
  echo "Error: template not found: $TEMPLATE_PATH" >&2
  exit 1
fi

# ---- Render to temp ----
TMP="$(mktemp "/tmp/nginx.test.XXXXXX.conf")"
cleanup() { [ "$KEEP_TMP" -eq 1 ] || rm -f "$TMP"; }
trap cleanup EXIT

# Export for envsubst
export PORT="$RUNTIME_PORT" NGINX_PORT="$RUNTIME_NGINX_PORT"

# Only substitute the two vars; leave anything else intact
envsubst '$PORT $NGINX_PORT' < "$TEMPLATE_PATH" > "$TMP"

# ---- Test ----
# Use sudo if needed; don’t assume it’s required
RUNNER="nginx"
if command -v sudo >/dev/null 2>&1; then
  if ! $RUNNER -t -c "$TMP" >/dev/null 2>&1; then
    RUNNER="sudo nginx"
  fi
fi

echo "Testing rendered config:"
echo "  Template:   $TEMPLATE_PATH"
echo "  PORT:       $PORT"
echo "  NGINX_PORT: $NGINX_PORT"
[ "$KEEP_TMP" -eq 1 ] && echo "  Rendered:   $TMP (kept)"

set +e
OUTPUT="$($RUNNER -t -c "$TMP" 2>&1)"
STATUS=$?
set -e

echo "$OUTPUT"

if [ $STATUS -eq 0 ]; then
  echo "✅ nginx config test SUCCESS"
  exit 0
else
  echo "❌ nginx config test FAILED (status $STATUS)"
  if [ "$KEEP_TMP" -eq 0 ]; then
    # On failure, keep the temp file to help debug
    KEEP_TMP=1
    trap - EXIT
    echo "Rendered file kept at: $TMP"
  fi
  # Print the upstream/listen lines to spot bad substitutions quickly
  echo "---- Rendered snippet (upstream/server) ----"
  awk '/upstream[[:space:]]+sveltekit/,/}/ {print} /server[[:space:]]*{/,/}/ {print}' "$TMP" | sed -n '1,120p' || true
  exit $STATUS
fi
