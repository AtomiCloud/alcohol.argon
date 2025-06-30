#!/usr/bin/env bash
set -eou pipefail

# 📤 Landscape Upload Script
# Uploads to specific landscapes

landscape="${1:-}"
deploy="${2:-}"
tag="${3:-}"

echo "🌍 Uploading to landscape: $landscape"
if [[ -n $tag ]]; then
  echo "🏷️  Release tag: $tag"
fi

echo "🔨 Building application with OpenNext..."
bunx opennextjs-cloudflare build

if [[ $deploy == "upload" ]]; then
  echo "📤 Uploading to $landscape environment..."
  if [[ -n $tag ]]; then
    wrangler versions upload --env "$landscape" --message "Release $tag"
  else
    wrangler versions upload --env "$landscape"
  fi

  echo "🎉 Uploaded to $landscape complete!"
else
  echo "🔨 Deploying to $landscape environment..."
  wrangler deploy --env "$landscape"
  echo "🎉 Deployed to $landscape complete!"
fi
