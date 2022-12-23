#!/bin/bash

DEMSAUSAGE_VERSION_FILE="./VERSION"
if [ ! -f "$DEMSAUSAGE_VERSION_FILE" ]; then
    echo "DemSausage version file not found!"
    exit 1
fi

DEMSAUSAGE_VERSION=`cat $DEMSAUSAGE_VERSION_FILE`
PUSH="$1"

DEMSAUSAGE_VERSION="$DEMSAUSAGE_VERSION"
DEMSAUSAGE_ADMIN_VERSION="$DEMSAUSAGE_VERSION"
DEMSAUSAGE_DJANGO_VERSION="$DEMSAUSAGE_VERSION"

\rm -f nginx/build/*/*.tgz
mkdir -p nginx/build/demsausage
mkdir -p nginx/build/demsausage-redesign
mkdir -p nginx/build/demsausage-admin
mkdir -p nginx/build/demsausage-api

# build production nginx image
# assumes local sources exist for DemocracySausage
# this is horrible, fixme
# cp ../demsausage/build/frontend-public-"$DEMSAUSAGE_VERSION".tgz nginx/build/demsausage
cp ../demsausage/build/frontend-public-redesign-"$DEMSAUSAGE_VERSION".tgz nginx/build/demsausage-redesign
# cp ../demsausage/build/frontend-admin-"$DEMSAUSAGE_ADMIN_VERSION".tgz nginx/build/demsausage-admin
# cp ../demsausage/build/django-"$DEMSAUSAGE_DJANGO_VERSION".tgz nginx/build/demsausage-api

echo building prod nginx container
(cd nginx && docker build -t sausage2/nginx:latest .)
# (cd nginx-prod && docker build --no-cache -t sausage/nginx:latest . && cd ..)

if [ "$PUSH" = "push" ]; then
    ./prodbuild-dockerpush-nginx.sh
fi