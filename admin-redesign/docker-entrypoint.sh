#!/bin/sh

command="$1"
cd /app

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