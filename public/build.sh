#!/bin/bash

rm -rf ./build
mkdir -p ./build

yarn run build
tar czvf ../nginx-prod/build/public.tgz ./build/