#!/bin/bash

rm -rf ./build
mkdir -p ./build

yarn run lint

yarn run build
cd ./build && tar czvf /build/admin.tgz .