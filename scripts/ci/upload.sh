#!/usr/bin/env bash
set -eou pipefail

# 📤 Landscape Upload Script
# Uploads to specific landscapes

landscape="${1:-}"
tag="${2:-}"

echo "🌍 Uploading to landscape: $landscape"
if [[ -n $tag ]]; then
  echo "🏷️  Release tag: $tag"
fi

echo "🔨 Building application with OpenNext..."
bunx opennextjs-cloudflare build

echo "📤 Uploading to $landscape environment..."
if [[ -n $tag ]]; then
  wrangler versions upload --env "$landscape" --message "Release $tag"
else
  wrangler versions upload --env "$landscape"
fi

echo "🎉 Upload to $landscape complete!"
