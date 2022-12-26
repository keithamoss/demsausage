#!/bin/bash

echo "Build..."
docker-compose build django
echo "Run..."
docker-compose run django build
echo "Tar..."
tar czvf ../nginx-prod/build/django.tgz ./static/
echo "Stop..."
docker-compose stop