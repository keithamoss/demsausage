#!/bin/bash

CMD="$1"
LATEST_IMAGE_TAG="latest-staging"

if [ x"$CMD" = x ]; then
    echo "provide a command!"
    exit 1
fi

if [ "$CMD" = "full-run" ]; then
    echo "Build - Prep"
    rm -rf ./nginx-prod/build/
    mkdir ./nginx-prod/build
fi

if [ "$CMD" = "django-only" ] || [ "$CMD" = "full-run" ]; then
    echo -e "\n\n Django - Build Static Assets"
    docker compose --file build_staging.yml run django

    echo -e "\n\n Containers - Build Django"
    cd django && docker build -t keithmoss/demsausage-django:$LATEST_IMAGE_TAG . && cd ../
fi

if [ "$CMD" = "frontend-only" ] || [ "$CMD" = "full-run" ]; then
    echo -e "\n\n Public Frontend - Build"
    docker compose --file build_staging.yml run public

    echo -e "\n\n Public Redesign - Build"
    docker compose --file build_staging.yml run public_redesign

    echo -e "\n\n Admin - Build"
    docker compose --file build_staging.yml run admin

    echo -e "\n\n Containers - Build Nginx"
    cd nginx-prod && docker build -t keithmoss/demsausage-nginx:$LATEST_IMAGE_TAG . && cd ../
fi

if [ "$CMD" = "full-run" ]; then
    echo -e "\n\n Containers - Build RQ Dashboard"
    cd rq-dashboard && docker build -t keithmoss/demsausage-rq-dashboard:$LATEST_IMAGE_TAG . && cd ../
fi

# Containers - Push to Docker Hub
if [ "$CMD" = "django-only" ]; then
    docker push keithmoss/demsausage-django:$LATEST_IMAGE_TAG
elif [ "$CMD" = "frontend-only" ]; then
    docker push keithmoss/demsausage-nginx:$LATEST_IMAGE_TAG
elif [ "$CMD" = "full-run" ]; then
    docker push keithmoss/demsausage-nginx:$LATEST_IMAGE_TAG
    docker push keithmoss/demsausage-django:$LATEST_IMAGE_TAG
    docker push keithmoss/demsausage-rq-dashboard:$LATEST_IMAGE_TAG
fi