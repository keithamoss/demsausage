#!/bin/sh

command="$1"
cd /app

if [ ! -d ".yarn" ]; then
  rm -f .yarn*
fi

yarn set version stable

yarn install

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  yarn run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi