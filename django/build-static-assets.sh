#!/bin/bash

docker-compose build django
docker-compose run django build
tar czvf ../nginx-prod/build/django.tgz ./static/
docker-compose stop