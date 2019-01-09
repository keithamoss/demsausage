#!/bin/bash

# push images to Docker Hub
# @TODO version images

ver="$1"

if [ x"$ver" = x ]; then
        echo "set a version!"
        exit 1
fi

# echo pushing prod nginx container
# docker tag sausage/nginx:latest sausage/nginx-prod:"$ver"
# docker push sausage/nginx:latest
# docker push sausage/nginx:"$ver"

echo versioning frontend assets
mv build/frontend-public.tgz build/frontend-public-$ver.tgz
mv build/frontend-admin.tgz build/frontend-admin-$ver.tgz