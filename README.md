# Democracy Sausage

## Installing and building

Requirements:

-   TypeScript 2.5.3
-   Node 9.11.2
-   NPM 5.6.0

### Extra files

Copy `secrets.php.template` to `secrets.php` and replace every REPLACEME.
Copy `client_secrets.php.template` to `client_secrets.php` and replace every REPLACEME.

These files aren't in the repo. Contact the project maintainers.

-   Save `demsausage.sqlite3` to the `db` directory.
-   Save the `sentry-php` folder to the base directory.
-   Save the `google-api-php-client-2.2.0` to the base directory.

### Admin site

cd admin
npm install
(PORT=3001 npm run start)

### Public site

cd public
npm install
(PORT=3000 npm run start)

### PHP server

cd php
php -S localhost:8000 -c user.ini

## Development

[TypeScript-React-Starter](https://github.com/Microsoft/TypeScript-React-Starter)

## Deploy

-   AWS S3 hosts the `Public` and `Admin` sites.
-   CloudFlare sits in front and handles caching and gives us HTTPS.
-   Travis CI handles automatic deploys from GitHub for us.
-   Duck CLI to ftp sync the legacy PHP API.

1.  S3 bucket setup for static website hosting, bucket policy set to public, and error document set to `index.html` to let React Router work.
    1.1 A second www.democracysausage.org bucket is setup to redirect requests to https://democracysausage.org
2.  CloudFlare just has default settings except for these Page Rules:
    2.2 api.democracysausage.org/\* Cache Level: Bypass
    2.3 democracysausage.org/static/\* Cache Level: Standard, Edge Cache TTL: A Month (Because S3 sends No Cache headers by default.)
    2.3 democracysausage.org/icons/\* Cache Level: Standard, Edge Cache TTL: A Month (Because S3 sends No Cache headers by default.)
3.  Travis CI setup with default settings to pull from `.travis.yml` with environment variables AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, CF_ZONE_ID, CF_EMAIL, CF_API_KEY, FTP_USERNAME, FTP_PASSWORD, FTP_PATH, REACT_APP_MAPBOX_API_KEY_PROD

```json
{
    "Version": "2012-10-17",
    "Id": "PublicBucketPolicy",
    "Statement": [
        {
            "Sid": "Stmt1482880670019",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME_HERE/*"
        }
    ]
}
```

#### Encrypting Secrets for Travis

Per Travis-CI's documentation on [encrypting multiple files containing secrets](https://docs.travis-ci.com/user/encrypting-files#Encrypting-multiple-files).

```
tar cvf secrets.tar secrets/travis.env secrets/demsausage-frontends.prod.env
travis encrypt-file --force secrets.tar
```

### Resources

-   [Moving a static website to AWS S3 + CloudFront with HTTPS](https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106)
-   [Host a Static Site on AWS, using S3 and CloudFront](https://www.davidbaumgold.com/tutorials/host-static-site-aws-s3-cloudfront/)
-   [S3 Deployment with Travis](https://renzo.lucioni.xyz/s3-deployment-with-travis/)
-   [Setting up a continuously deployed static website with SSL](https://blog.kolibri.is/setting-up-a-continuously-deployed-static-website-with-ssl-39670b37b5c6)
-   [Deploying a static site to Github Pages using Travis and Cloudflare](https://jmsbrdy.com/2017/07/deploying-a-static-site-to-github-pages-using-travis-and-cloudflare/)
-   [Secure and fast GitHub Pages with CloudFlare](https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/)
-   [How to get your SSL for free on a Shared Azure website with CloudFlare](https://www.troyhunt.com/how-to-get-your-ssl-for-free-on-shared/)
