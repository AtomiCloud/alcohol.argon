#!/usr/bin/env bash
set -euo pipefail

# Parse arguments
platform="$1"
service="$2"
spec_url="${3:-}"

# Validate inputs
[[ -z $service ]] && echo "❌ Service name required" && exit 1

# Determine spec URL
[[ -z $spec_url ]] && echo "❌ No spec URL provided for $service" && exit 1

# Validate spec URL format
[[ ! $spec_url =~ ^https?:// ]] && echo "❌ Invalid URL: $spec_url" && exit 1

# Check project structure
[[ ! -f "package.json" ]] && echo "❌ Run from project root" && exit 1

# Set output directory
output_dir="$(pwd)/src/clients/$platform/$service"

echo "🚀 Generating SDK for $platform/$service..."
echo "📄 Spec: $spec_url"
echo "📁 Output: $output_dir"

# Create output directory
mkdir -p "$output_dir"

# Generate SDK
swagger-typescript-api generate \
  -p "$spec_url" \
  -o "$output_dir" \
  --name "api.ts" \
  --api-class-name="${platform^}${service^}Api" \
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
