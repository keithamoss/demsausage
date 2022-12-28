#!/bin/sh

command="$1"
cd /app

if [ "$REACT_APP_ENVIRONMENT" = "DEVELOPMENT" ]; then
  if [ ! -d "node_modules" ]; then
    yarn
  fi

  yarn run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi