#!/usr/bin/env bash
set -euo pipefail

# Never inherit Infisical, registry, Cloudflare or application credentials.
for file in .env .env.local .env.development .env.development.local .env.production .env.production.local .dev.vars .dev.vars.pichu; do
  if [[ -e $file ]]; then
    echo 'Synthetic checks require a worktree without framework environment files.' >&2
    exit 1
  fi
done
home="$(mktemp -d)"
trap 'rm -rf "$home"' EXIT
env -i PATH="$PATH" HOME="$home" \
  NEXT_TELEMETRY_DISABLED=1 WRANGLER_SEND_METRICS=false CI=1 \
  ARGON_SECURITY_SYNTHETIC=1 \
  LANDSCAPE=pichu \
  ATOMI_SERVER__AUTH__LOGTO__APP__SECRET=synthetic-argon-app-private-7ed51 \
  ATOMI_SERVER__AUTH__LOGTO__COOKIE__SECRET=synthetic-argon-cookie-private-7ed51-long-enough-for-session-encryption \
  ATOMI_SERVER__AUTH__LOGTO__APP__ID=synthetic-app \
  ATOMI_SERVER__AUTH__LOGTO__APP__ENDPOINT=http://127.0.0.1:3301 \
  ATOMI_SERVER__AUTH__LOGTO__URL=http://localhost:3300 \
  ATOMI_SERVER__DB__URL=postgresql://synthetic:synthetic@127.0.0.1:3301/synthetic \
  ATOMI_SERVER__UNREVIEWED=synthetic-argon-unknown-server-7ed51 \
  ATOMI_CLIENT__UNREVIEWED=synthetic-argon-unknown-client-7ed51 \
  ATOMI_COMMON__APP__UNREVIEWED=synthetic-argon-unknown-common-7ed51 \
  ATOMI_CLIENT__FARO__BUILD__KEY=synthetic-argon-faro-build-private-7ed51 \
  ATOMI_CLIENT__FARO__BUILD__ENABLED=false \
  ATOMI_CLIENT__FARO__ENABLED=false \
  ATOMI_CLIENT__FARO__COLLECTORURL=http://127.0.0.1:3301/public-collector \
  ATOMI_CLIENT__TRACKER__PLAUSIBLE__ENABLED=false \
  ATOMI_COMMON__APP__NAME=argon-public-control-7ed51 \
  ATOMI_COMMON__CLIENTS__ALCOHOL__ZINC__URL=http://127.0.0.1:3301 \
  ARGON_SECURITY_ORIGIN=http://localhost:3300 \
  ARGON_SECURITY_ASSET_ROOT="${ARGON_SECURITY_ASSET_ROOT:-.next/static}" \
  ARGON_SECURITY_REPORT="${ARGON_SECURITY_REPORT:-.amp/in/browser-assets.json}" \
  ARGON_SECURITY_RUNTIME_OVERRIDES="${ARGON_SECURITY_RUNTIME_OVERRIDES:-0}" \
  ARGON_SECURITY_MISSING_RUNTIME="${ARGON_SECURITY_MISSING_RUNTIME:-0}" \
  "$@"
