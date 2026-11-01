#!/usr/bin/env bash
# Usage: ./upload.sh BUCKET [DIR=testdata]. Needs the AWS CLI and credentials.
set -euo pipefail
BUCKET=${1:?bucket name (terraform output bucket)}
DIR=${2:-testdata}
IMM="public, max-age=31536000, immutable"
SHORT="public, max-age=30"

# Content-Type is application/json (not geo+json) so CloudFront's edge compression applies.
aws s3 sync "$DIR/data/v1" "s3://$BUCKET/data/v1" --content-type application/json --cache-control "$IMM" --only-show-errors
aws s3 cp "$DIR/data/manifest.json" "s3://$BUCKET/data/manifest.json" --content-type application/json --cache-control "$SHORT"
aws s3 cp "$DIR/data/v1br/e1/points.geojson.br" "s3://$BUCKET/data/v1br/e1/points.geojson" \
  --content-type application/json --content-encoding br --cache-control "$IMM"
aws s3 sync "$DIR/api" "s3://$BUCKET/api" --content-type application/json --cache-control "$SHORT" --only-show-errors
echo "Uploaded. Try: curl -sI --compressed https://\$(terraform output -raw cloudfront_domain)/data/v1/e1/points.geojson"
