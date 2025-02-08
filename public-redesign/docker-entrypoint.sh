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

if [ ! -d node_modules ]; then
  # --force ensures the optional dep @rollup/rollup-linux-x64-musl gets installed
  pnpm install --force
fi

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  pnpm run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi