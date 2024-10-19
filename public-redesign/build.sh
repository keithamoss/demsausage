#!/bin/bash

rm -rf ./build
mkdir -p ./build

# Avoid JavaScript heap out of memory errors from Vite
# https://github.com/vitejs/vite/issues/2433
export NODE_OPTIONS=--max-old-space-size=8192
pnpm run build
cd ./build && tar czvf /build/public-redesign.tgz .