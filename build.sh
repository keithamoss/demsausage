#!/bin/bash

CMD="$1"

if [ x"$CMD" = x ]; then
    echo "provide a command!"
    exit 1
fi

if [ "$CMD" = "full-run" ]; then
    # Build - Prep
    rm -rf ./nginx-prod/build/
    mkdir ./nginx-prod/build
fi

if [ "$CMD" = "frontend-only" ] || [ "$CMD" = "full-run" ]; then
    # Public Frontend - Build
    cd public && ./build.sh && cd ../

    # Public Redesign - Build
    cd public-redesign && ./build.sh && cd ../

    # Admin - Build
    cd admin && ./build.sh && cd ../

    # Containers - Build Nginx
    cd nginx-prod && docker build -t sausage2/nginx:latest . && cd ../
fi

if [ "$CMD" = "django-only" ] || [ "$CMD" = "full-run" ]; then
    # Django - Build Static Assets
    docker compose --file build.yml run django
    
    # Containers - Build Django
    cd django && docker build -t sausage2/django:latest . && cd ../
fi

# Containers - Push to Docker Hub
docker tag sausage2/nginx:latest keithmoss/sausage2-nginx:latest
docker push keithmoss/sausage2-nginx:latest
docker tag sausage2/django:latest keithmoss/sausage2-django:latest
docker push keithmoss/sausage2-django:latest