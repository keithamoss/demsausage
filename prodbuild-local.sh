#!/bin/bash

CMD="$1"

if [ x"$CMD" = x ]; then
    echo "provide a command!"
    exit 1
fi

if [ "$CMD" = "frontend" ] || [ "$CMD" = "all" ]; then
    \rm -f nginx-prod/build/*.tgz
    mkdir -p nginx-prod/build/

    # build the frontend assets (this takes quite a while due to minification)
    docker-compose -f docker-compose-buildjs.prod-local.yml run frontend_public
    docker-compose -f docker-compose-buildjs.prod-local.yml stop
    docker-compose -f docker-compose-buildjs.prod-local.yml run frontend_admin
    docker-compose -f docker-compose-buildjs.prod-local.yml stop

    # build the django assets
    docker-compose -f docker-compose-buildpy.yml build
    docker-compose -f docker-compose-buildpy.yml run django
    docker-compose -f docker-compose-buildpy.yml stop

    # copy assets locally for build local production nginx image (local testing only)
    cp build/frontend-public.tgz build/frontend-admin.tgz build/django.tgz nginx-prod/build # this is horrible, fixme

    # For local testing with docker-compose-prod.yml only
    echo building prod nginx container
    (cd nginx-prod && docker build -t demsausage/nginx-prod:latest .)
    # (cd nginx-prod && docker build --no-cache -t demsausage/nginx-prod:latest . && cd ..)
fi

if [ "$CMD" = "django" ] || [ "$CMD" = "all" ]; then
    echo building prod django container
    (cd django && docker build -t demsausage/django:latest .)
    # (cd django && docker build --no-cache -t demsausage/django:latest . && cd ..)
fi