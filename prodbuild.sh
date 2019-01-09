#!/bin/bash

\rm -f nginx-prod/build/*.tgz
mkdir -p nginx-prod/build/

# build the frontend assets (this takes quite a while due to minification)
docker-compose -f docker-compose-buildjs.yml run frontend_public
docker-compose -f docker-compose-buildjs.yml stop
docker-compose -f docker-compose-buildjs.yml run frontend_admin
docker-compose -f docker-compose-buildjs.yml stop

# copy assets locally for build local production nginx image (local testing only)
cp build/frontend-public.tgz build/frontend-admin.tgz nginx-prod/build # this is horrible, fixme

# For local testing with docker-compose-prod.yml only
# echo building prod nginx container
# (cd nginx-prod && docker build -t sausage/nginx-prod:latest .)
# (cd nginx-prod && docker build --no-cache -t sausage/nginx-prod:latest . && cd ..)

# build the frontend assets (this takes quite a while due to minification)
# (cd public && npm run build && cd build && tar czvf ../../build/frontend-public.tgz .)
# (cd admin && npm run build && cd build && tar czvf ../../build/frontend-admin.tgz .)