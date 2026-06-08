#!/bin/sh
set -eu

CODEX_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

if [ -x "$CODEX_NODE" ]; then
  exec "$CODEX_NODE" node_modules/next/dist/bin/next dev --webpack "$@"
fi

exec node node_modules/next/dist/bin/next dev --webpack "$@"
