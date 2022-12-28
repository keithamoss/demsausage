#!/bin/bash

rm -rf ./build
mkdir -p ./build

# For GitHub actions
if [ ! -d "node_modules" ]; then
    yarn
fi

yarn run lint

yarn run build
cd ./build && tar czvf /build/admin.tgz .