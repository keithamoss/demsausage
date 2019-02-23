# Democracy Sausage

## Installing and building

Requirements:

-   Docker 18.09.0+
-   Docker Compose 1.23.2+

### First Time

If this is the first time you're running Democracy Sausage you'll need to:

#### Hosts file

Add the following to your [hosts file](<https://en.wikipedia.org/wiki/Hosts_(file)>).

```
127.0.0.1 test.democracysausage.org
127.0.0.1 admin.test.democracysausage.org
```

#### .env files

Use the template .env files in `secrets-tmpl` to create corresponding files under `secrets/` for:

1. `sausage-web.dev.env`
2. `sausage-web-db.dev.env`
3. `sausage-db.dev.env`
4. `sausage-public-frontend.dev.env`
5. `sausage-admin-frontend.dev.env`

#### Admin Site

1. Add yourself to the `app_allowedusers` table before trying to login
2. Load `initial_data/polling_place_facility_types.csv into`app_pollingplacefacilitytype`
3. Create a test election for yourself and load some polling places into it via the UI (contact the project maintainers for a sample)

### Run both sites

`docker-compose up`
Then navigate to the URLs given below

### Public site

Navigate to https://test.democracysausage.org

### Admin site

Navigate to https://admin.test.democracysausage.org

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
