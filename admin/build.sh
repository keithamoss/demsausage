#!/bin/bash

rm -rf ./build
mkdir -p ./build

yarn run lint

yarn run build
tar czvf ../nginx-prod/build/admin.tgz ./build/