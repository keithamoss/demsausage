#!/bin/bash

rm -rf ./build
mkdir -p ./build

# For GitHub actions
if [ ! -d "node_modules" ]; then
    yarn
fi

# Avoid JavaScript heap out of memory errors from Vite
# https://github.com/vitejs/vite/issues/2433
export NODE_OPTIONS=--max-old-space-size=8192
yarn run build
cd ./build && tar czvf /build/public.tgz .