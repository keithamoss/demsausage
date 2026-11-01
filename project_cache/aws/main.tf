terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.40"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.5"
    }
  }
}

variable "region" {
  description = "Region for the S3 bucket. CloudFront itself is global."
  type        = string
  default     = "ap-southeast-2"
}

variable "name_prefix" {
  description = "Prefix for resource names. The bucket name gets a random suffix."
  type        = string
  default     = "demsausage-static-test"
}

variable "price_class" {
  description = "PriceClass_100 (NA/EU only) is cheapest; PriceClass_All includes Australian edges, which matters when testing from Australia."
  type        = string
  default     = "PriceClass_All"
}

variable "origin_shield_region" {
  description = "Set to the bucket region to enable Origin Shield (extra cost), or leave null."
  type        = string
  default     = null
}

provider "aws" {
  region = var.region
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "static" {
  bucket        = "${var.name_prefix}-${random_id.suffix.hex}"
  force_destroy = true # test stack: allow `terraform destroy` with objects in it
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket                  = aws_s3_bucket.static.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "static" {
  name                              = "${var.name_prefix}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Immutable, versioned objects (data/v*/...). Compress=true on the behaviour makes
# CloudFront gzip/brotli uncompressed objects (1 KB - 10 MB) per Accept-Encoding.
resource "aws_cloudfront_cache_policy" "immutable" {
  name        = "${var.name_prefix}-immutable"
  min_ttl     = 1
  default_ttl = 31536000
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# The manifest (pointer to the current version) and the rewritten legacy API
# paths change when we publish, so keep their TTL short.
resource "aws_cloudfront_cache_policy" "short" {
  name        = "${var.name_prefix}-short"
  min_ttl     = 0
  default_ttl = 30
  max_ttl     = 60

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "cors" {
  name = "${var.name_prefix}-cors"

  cors_config {
    access_control_allow_credentials = false
    origin_override                  = true

    access_control_allow_headers {
      items = ["*"]
    }
    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }
    access_control_allow_origins {
      items = ["*"]
    }
    access_control_expose_headers {
      items = ["Content-Length", "Content-Range", "ETag"]
    }
    access_control_max_age_sec = 86400
  }

  custom_headers_config {
    items {
      header   = "Timing-Allow-Origin"
      value    = "*"
      override = true
    }
  }
}

# Keeps the legacy third-party URLs working:
#   /api/0.1/map/?election_id=7  -> /api/0.1/map/7.json
#   /api/0.1/elections/public/   -> /api/0.1/elections/public.json
resource "aws_cloudfront_function" "legacy_api_rewrite" {
  name    = "${var.name_prefix}-legacy-api-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      var qs = request.querystring;

      if (uri === '/api/0.1/map/' && qs.election_id && /^[0-9]+$/.test(qs.election_id.value)) {
        request.uri = '/api/0.1/map/' + qs.election_id.value + '.json';
        request.querystring = {};
      } else if (uri === '/api/0.1/elections/public/') {
        request.uri = '/api/0.1/elections/public.json';
        request.querystring = {};
      }
      return request;
    }
  EOT
}

resource "aws_cloudfront_distribution" "static" {
  enabled         = true
  comment         = "${var.name_prefix} static public site test"
  http_version    = "http2and3"
  is_ipv6_enabled = true
  price_class     = var.price_class

  origin {
    domain_name              = aws_s3_bucket.static.bucket_regional_domain_name
    origin_id                = "s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.static.id

    dynamic "origin_shield" {
      for_each = var.origin_shield_region == null ? [] : [1]
      content {
        enabled              = true
        origin_shield_region = var.origin_shield_region
      }
    }
  }

  default_cache_behavior {
    target_origin_id           = "s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.short.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  ordered_cache_behavior {
    path_pattern               = "/data/*"
    target_origin_id           = "s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.immutable.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  ordered_cache_behavior {
    path_pattern               = "/api/0.1/*"
    target_origin_id           = "s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.short.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.legacy_api_rewrite.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

data "aws_iam_policy_document" "bucket" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.static.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.static.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "static" {
  bucket = aws_s3_bucket.static.id
  policy = data.aws_iam_policy_document.bucket.json
}

output "bucket" {
  value = aws_s3_bucket.static.bucket
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.static.domain_name
}

output "distribution_id" {
  value = aws_cloudfront_distribution.static.id
}
