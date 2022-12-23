#!/bin/bash

rm -rf ./build
mkdir -p ./build

yarn run build
tar czvf ./frontend-public-redesign.tgz ./build/