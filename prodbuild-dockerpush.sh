#!/bin/bash

# push images to Docker Hub

if [ ! -f ./VERSION ]; then
    echo "File not found!"
    exit 1
fi

VERSION=`cat VERSION`
CMD="$1"

if [ x"$VERSION" = x ]; then
    echo "set a version!"
    exit 1
fi

if [ x"$CMD" = x ]; then
    echo "provide a command!"
    exit 1
fi

if [ "$CMD" = "frontend" ] || [ "$CMD" = "all" ]; then
    # echo pushing prod nginx container
    # docker tag demsausage/nginx-prod:latest demsausage/nginx-prod:"$VERSION"
    # docker push demsausage/nginx:latest
    # docker push demsausage/nginx:"$VERSION"

    echo versioning frontend assets
    # mv build/frontend-public.tgz build/frontend-public-$VERSION.tgz
    mv build/frontend-public-redesign.tgz build/frontend-public-redesign-$VERSION.tgz
    # mv build/frontend-admin.tgz build/frontend-admin-$VERSION.tgz
    # mv build/django.tgz build/django-$VERSION.tgz
fi

if [ "$CMD" = "django" ] || [ "$CMD" = "all" ]; then
    echo pushing prod django container
    docker tag demsausage/django:latest keithmoss/demsausage-django:latest
    docker tag demsausage/django:latest keithmoss/demsausage-django:"$VERSION"
    docker push keithmoss/demsausage-django:latest
    docker push keithmoss/demsausage-django:"$VERSION"
fi