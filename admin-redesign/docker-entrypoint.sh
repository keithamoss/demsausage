#!/bin/sh

command="$1"
cd /app

# Temporarily workaround a corepack bug
# Ref: https://stackoverflow.com/a/79415251/7368493
echo "Before: corepack version => $(corepack --version || echo 'not installed')"
npm install -g corepack@latest
echo "After : corepack version => $(corepack --version)"
corepack enable

corepack enable pnpm

# If node_modules comes from the host (bind mount), it may be missing Linux
# optional deps like @rollup/rollup-linux-x64-musl.
if [ ! -d node_modules ]; then
  pnpm install --force
elif ! node -e "require.resolve('@rollup/rollup-linux-x64-musl')" >/dev/null 2>&1; then
  # Install only the matching native Rollup package first (fast path), then
  # fall back to a full reinstall if that still doesn't satisfy the runtime.
  ROLLUP_VERSION="$(node -e "try{console.log(require('rollup/package.json').version)}catch(e){process.exit(1)}")"

  if [ -n "$ROLLUP_VERSION" ]; then
    pnpm add --no-save "@rollup/rollup-linux-x64-musl@$ROLLUP_VERSION" || true
  fi

  if ! node -e "require.resolve('@rollup/rollup-linux-x64-musl')" >/dev/null 2>&1; then
    pnpm install --force
  fi
fi

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  pnpm run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi
