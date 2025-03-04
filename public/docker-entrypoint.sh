#!/bin/sh

command="$1"
cd /app

# Presence of the "packageManager" field indicates that the project is meant to be used with Corepack, a tool included by default with all official Node.js distributions starting from 16.9 and 14.19.
# Corepack must currently be enabled by running corepack enable in your terminal. For more information, check out https://yarnpkg.com/corepack.
corepack enable

if [ ! -d ".yarn" ]; then
  rm -f .yarn*
fi

yarn set version stable

# --no-immutable only to workaround the bug where GHA will change the lockfile (e.g. @adobe/css-tools cacheKey) from what local dev set
# No idea why, it could be due to the ancient deps we've got. Ignoring it as it only affects public/ and admin/ and we're freezing those parts of the codebase.
yarn install --no-immutable

if [ "$VITE_ENVIRONMENT" = "DEVELOPMENT" ]; then
  yarn run start
  exit
fi

if [ x"$command" = x"build" ]; then
    . /app/build.sh
    exit
fi