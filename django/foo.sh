#!/bin/bash

echo "Secrets..."
pwd
ls -l
echo "Env vars..."
echo "FOO: $FOO"
echo "BUILD: $BUILD"
echo "RAVEN_SITE_NAME: $RAVEN_SITE_NAME"
echo "DOG: $DOG"
echo "FISH: $FISH"
echo "ENVIRONMENT: $ENVIRONMENT"
echo "MEMCACHED_LOCATION: $MEMCACHED_LOCATION"
echo "GOOGLE_GEOCODING_API_KEY: $GOOGLE_GEOCODING_API_KEY"

echo "Going away now..."