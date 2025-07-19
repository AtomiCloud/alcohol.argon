#!/usr/bin/env bash

set -eou pipefail

echo "🔧 Exporting build info and building application..."

eval "$(./scripts/ci/export_build_info.sh)"

bunx opennextjs-cloudflare build

wrangler dev --env lapras
