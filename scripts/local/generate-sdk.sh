#!/usr/bin/env bash
set -euo pipefail

# Parse arguments
service="$1"
spec_url="${2:-}"

# Validate inputs
[[ -z $service ]] && echo "❌ Service name required" && exit 1

# Determine spec URL
[[ -z $spec_url ]] && echo "❌ No spec URL provided for $service" && exit 1

# Validate spec URL format
[[ ! $spec_url =~ ^https?:// ]] && echo "❌ Invalid URL: $spec_url" && exit 1

# Check project structure
[[ ! -f "package.json" ]] && echo "❌ Run from project root" && exit 1

# Set output directory
output_dir="$(pwd)/src/clients/$service/generated"

echo "🚀 Generating SDK for $service..."
echo "📄 Spec: $spec_url"
echo "📁 Output: $output_dir"

# Create output directory
mkdir -p "$output_dir"

# Generate SDK
bunx swagger-typescript-api generate \
  -p "$spec_url" \
  -o "$output_dir" \
  --name "$service-api.ts" \
  --client-type "fetch" \
  --responses \
  --add-readonly \
  --extract-request-params \
  --extract-request-body \
  --extract-enums \
  --extract-response-body \
  --extract-responses \
  --unwrap-response-data \
  --union-enums

echo "✅ SDK generated successfully"
