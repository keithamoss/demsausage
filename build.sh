#!/bin/bash

pwd
ls -l ./secrets
echo "Building..."
docker-compose -f build.yml build django
pwd
ls -l ./secrets
echo "Running..."
docker-compose -f build.yml run django