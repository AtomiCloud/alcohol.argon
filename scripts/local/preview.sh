#!/usr/bin/env bash

l="${LANDSCAPE}"

set -eou pipefail

echo "🔧 Exporting build info and building application..."

eval "$(./scripts/ci/export_build_info.sh)"

bunx opennextjs-cloudflare build

echo "NEXTJS_ENV=development" >".dev.vars"
infisical export "--env=$l" >>".dev.vars"

wrangler dev --env "$l"
