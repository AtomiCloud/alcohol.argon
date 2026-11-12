#!/usr/bin/env bash
set -eou pipefail

# Unit tests. Run in CI via `nix develop .#ci -c ./scripts/ci/test.sh`,
# or locally with `pls test`.
echo "⬇️ Installing Dependencies..."
bun install --frozen-lockfile
echo "✅ Done!"

echo "🧪 Running Tests..."
bun test
echo "✅ Done!"
