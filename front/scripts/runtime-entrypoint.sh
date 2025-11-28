#!/usr/bin/env bash

set -euo pipefail

API_URL="${NEXT_PUBLIC_API_URL:-${API_URL:-http://localhost:8080}}"

cat <<EOF >/app/public/runtime-env.js
window.__ENV__ = window.__ENV__ || {};
window.__ENV__.NEXT_PUBLIC_API_URL = "${API_URL}";
EOF

export NEXT_PUBLIC_API_URL="${API_URL}"

exec "$@"

