#!/bin/bash

rm -rf ./build
mkdir -p ./build

# Avoid JavaScript heap out of memory errors from Vite
# https://github.com/vitejs/vite/issues/2433
export NODE_OPTIONS=--max-old-space-size=8192

# Temporarily workaround a corepack bug
# Ref: https://stackoverflow.com/a/79415251/7368493
echo "Before: corepack version => $(corepack --version || echo 'not installed')"
npm install -g corepack@latest
echo "After : corepack version => $(corepack --version)"
corepack enable

pnpm run build
cd ./build && tar czvf /build/public-redesign.tgz .
