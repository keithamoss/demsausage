#!/bin/bash

# push images to Docker Hub
# @TODO version images

ver="$1"
CMD="$2"

if [ x"$ver" = x ]; then
    echo "set a version!"
    exit 1
fi

if [ x"$CMD" = x ]; then
    echo "provide a command!"
    exit 1
fi

if [ "$CMD" = "frontend" ] || [ "$CMD" = "all" ]; then
    # echo pushing prod nginx container
    # docker tag demsausage/nginx-prod:latest demsausage/nginx-prod:"$ver"
    # docker push demsausage/nginx:latest
    # docker push demsausage/nginx:"$ver"

    echo versioning frontend assets
    mv build/frontend-public.tgz build/frontend-public-$ver.tgz
    mv build/frontend-admin.tgz build/frontend-admin-$ver.tgz
    mv build/django.tgz build/django-$ver.tgz
fi

if [ "$CMD" = "django" ] || [ "$CMD" = "all" ]; then
    echo pushing prod django container
    docker tag demsausage/django:latest keithmoss/demsausage-django:latest
    docker tag demsausage/django:latest keithmoss/demsausage-django:"$ver"
    docker push keithmoss/demsausage-django:latest
    docker push keithmoss/demsausage-django:"$ver"
fi