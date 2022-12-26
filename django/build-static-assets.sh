#!/bin/bash

echo "Build..."
docker-compose -f ../docker-compose.yml build django
echo "Run..."
docker-compose -f ../docker-compose.yml run django build
echo "Tar..."
tar czvf ../nginx-prod/build/django.tgz ./static/
echo "Stop..."
docker-compose -f ../docker-compose.yml stop