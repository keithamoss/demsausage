# Democracy Sausage

## Installing and building

Requirements:

- Docker 18.09.0+
- Docker Compose 1.23.2+

### First Time

If this is the first time you're running Democracy Sausage you'll need to:

#### Hosts file

Add the following to your [hosts file](<https://en.wikipedia.org/wiki/Hosts_(file)>).

```
127.0.0.1 public.test.democracysausage.org
127.0.0.1 admin.test.democracysausage.org
```

#### Generate self-signed SSL certs

Install [mkcert](https://github.com/FiloSottile/mkcert) and generate self-signed certs for local dev.

```
brew install mkcert
mkcert -install
```

```
mkdir keys && cd $_
mkcert public.test.democracysausage.org
mkcert admin.test.democracysausage.org
```

#### .env files

Use the template .env files in `secrets-tmpl` to create corresponding files under `secrets/` for:

1. `sausage-web.dev.env`
2. `sausage-web-db.dev.env`
3. `sausage-db.dev.env`
4. `sausage-public-frontend.dev.env`
5. `sausage-admin-frontend.dev.env`

#### Load data

If you're starting from scratch:

##### Load electoral boundaries data

Follow the instructions in `data/federal_2019/electoral_boundaries/README.md` to load in the 2019 Federal electoral boundaries.

##### Load production database dump

Alternatively, if you have access to the production database you can use the scripts in this repo to initialise your environment with its current state.

```
docker-compose up db
docker exec -i -t demsausage-db-1 /bin/bash
cd /var/lib/postgresql/scripts
./replace-dev-with-prod.sh
```

#### Admin Site

1. Add yourself to the `app_allowedusers` table before trying to login
2. Load `initial_data/polling_place_facility_types.csv` into `app_pollingplacefacilitytype`
3. Create a test election for yourself and load some polling places into it via the UI (contact the project maintainers for a sample)

### Run both sites

`docker-compose up`
Then navigate to the URLs given below

### Public site

Navigate to https://test.democracysausage.org

### Admin site

Navigate to https://admin.test.democracysausage.org

## Development

### Browser Testing

Cross browser testing thanks to BrowserStack.

[<img src="assets/browserstack/Browserstack-logo@2x.png" width="300" height="65" alt="BrowserStack logo" />](https://www.browserstack.com)

### Memcached

Memcached is used to cache public-facing API endpoints to lighten the load on the backend Django service. For debugging purposes we can retrieve a list of currently set memcached key by:

```
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' demsausage_memcached_1

telnet 172.27.0.5 11211

> Show general stats
stats

> Show all of the "slabs" in memcached (groups of keys)
stats slabs
STAT 18:chunk_size 4544
STAT 18:chunks_per_page 230
...

> Dump a list of all items stored in a given slab (in this case, slab 18)
stats cachedump 18 0
ITEM demsausage_:1:elections_list [4321 b; 0 s]
```

## Deploy

- AWS S3 hosts the `Public` and `Admin` sites.
- CloudFlare sits in front and handles caching and gives us HTTPS.
- Travis CI handles automatic deploys from GitHub for us.
- Duck CLI to ftp sync the legacy PHP API.

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

- [Moving a static website to AWS S3 + CloudFront with HTTPS](https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106)
- [Host a Static Site on AWS, using S3 and CloudFront](https://www.davidbaumgold.com/tutorials/host-static-site-aws-s3-cloudfront/)
- [S3 Deployment with Travis](https://renzo.lucioni.xyz/s3-deployment-with-travis/)
- [Setting up a continuously deployed static website with SSL](https://blog.kolibri.is/setting-up-a-continuously-deployed-static-website-with-ssl-39670b37b5c6)
- [Deploying a static site to Github Pages using Travis and Cloudflare](https://jmsbrdy.com/2017/07/deploying-a-static-site-to-github-pages-using-travis-and-cloudflare/)
- [Secure and fast GitHub Pages with CloudFlare](https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/)
- [How to get your SSL for free on a Shared Azure website with CloudFlare](https://www.troyhunt.com/how-to-get-your-ssl-for-free-on-shared/)

# Logs

scp -r demsausage:/apps/digitalocean-stack/logs/ .

docker-compose logs service_name

docker-compose -f docker-compose-prod-demsausage.yml logs service_name

# Open Graph rich link previews

We're using the [Open Graph](https://ogp.me) standard to show rich link previews for the socials.

For testing, [Social Share Preview](https://socialsharepreview.com) (and its browser extension) are super useful. [MetaTags.io](https://metatags.io) was also useful.

References:

- [Open Graph Spec](https://ogp.me)
- [Twitter Cards Spec](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)

## Testing

🤦‍♂️ the [Social Share Preview](https://socialsharepreview.com) browser extension works perfectly well with https://public.test.democracysausage.org

..so I don't think we needed localtunnel after all? Like, it's only useful for checking with the web-based versions of the testers.

## localtunnel testing

Sourced from [this StackOverflow post](https://stackoverflow.com/questions/8569892/how-to-test-open-graph-on-localhost).

https://github.com/localtunnel/localtunnel

`brew install localtunnel`
`lt --port 443 --subdomain public-test-demsausage --local-https --allow-invalid-cert --print-requests`

We've also added `public-test-demsausage.loca.lt` to our local dev NGinx config.

Issues:

The docs say we can set `-local-host public.test.democracysausage.org` to have it change the hostname to look like our local testing domain, but that didn't work. So we worked around it per the details below.

Generating the map preview images fails with CORS errors because it assumes it's on public.test.democracysausage.org (Could fix by changing `PUBLIC_SITE_URL` for the `django` container).

The simplest (read: least changes required) fix would be to just get CORS working so the loca.lt domain can request to public.test.democracysausage.org

### settings.py

`ALLOWED_HOSTS_AND_WHITELIST = f"{get_env('ALLOWED_HOSTS_AND_WHITELIST')},https://public-test-demsausage.loca.lt"`

### app.tsx

```
export function getAPIBaseURL(): string {
  // return process.env.REACT_APP_API_BASE_URL!
  return 'https://public-test-demsausage.loca.lt/api'
}
```
