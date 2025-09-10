#!/usr/bin/env bash

l="${LANDSCAPE}"

set -eou pipefail

echo "🔧 Exporting build info and building application..."

eval "$(./scripts/ci/export_build_info.sh)"

bunx opennextjs-cloudflare build

infisical run "--env=$l" -- wrangler dev --env lapras
