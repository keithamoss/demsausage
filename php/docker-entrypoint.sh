#!/bin/sh

command="$1"
cd /app/sausage_api

if [ "$ENVIRONMENT" = "DEVELOPMENT" ]; then
  php -S 0.0.0.0:8002 -c user.ini
  exit 1
fi

# if [ x"$command" = x"build" ]; then
#     export TERM=xterm

#     rm -rf /app/build
#     mkdir -p /app/build

#     npm run build
#     cd /app/build && tar czvf /build/frontend-admin.tgz .
#     exit
# fi