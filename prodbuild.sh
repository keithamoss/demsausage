#!/bin/bash

# build the frontend assets (this takes quite a while due to minification)
(cd public && npm run build && cd build && tar czvf ../../build/frontend-public.tgz .)
(cd admin && npm run build && cd build && tar czvf ../../build/frontend-admin.tgz .)