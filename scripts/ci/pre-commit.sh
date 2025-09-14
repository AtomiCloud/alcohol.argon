#!/usr/bin/env bash
set -eou pipefail

# install dependencies
echo "⬇️ Installing Dependencies..."

bun install --frozen-lockfile

echo "✅ Done!"

# run precommit
echo "🏃‍➡️ Running Pre-Commit..."
pre-commit run --all -v
echo "✅ Done!"
