#!/usr/bin/env bash
set -eou pipefail

# 🔧 Build Info Export Script
# Ultra-simple procedural script for build information export

echo "🔧 Extracting build information..." >&2

# Extract commit SHA with fallback
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "📝 Commit SHA: $COMMIT_SHA" >&2

# Extract version from git tags with fallback
VERSION=$(git describe --tags --match 'v*' --abbrev=0 2>/dev/null | sed 's/^v//' || echo "unknown")
echo "🏷️  Version: $VERSION" >&2

# Generate build timestamp in milliseconds for JavaScript Date compatibility
BUILD_TIME=$(date +%s)000
echo "⏰ Build time: $BUILD_TIME" >&2

# Get landscape from environment with fallback
LANDSCAPE="${LANDSCAPE:-${ATOMI_LANDSCAPE:-base}}"
echo "🌍 Landscape: $LANDSCAPE" >&2

# Export core build variables
echo "export LANDSCAPE=\"$LANDSCAPE\""
echo "export ATOMI_COMMON__APP__BUILD__SHA=\"sha-$COMMIT_SHA\""
echo "export ATOMI_COMMON__APP__BUILD__VERSION=\"$VERSION\""
echo "export ATOMI_COMMON__APP__BUILD__TIME=\"$BUILD_TIME\""
echo "export ATOMI_COMMON__APP__SERVICETREE__LANDSCAPE=\"$LANDSCAPE\""

echo "✅ Build info exported successfully" >&2
