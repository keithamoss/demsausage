# Democracy Sausage

## Installing and building

Requirements:

- Docker 18.09.0+
- Docker Compose 1.23.2+

### First Time

If this is the first time you're running Democracy Sausage you'll need to do a few things:

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
docker compose up db
docker exec -i -t demsausage-db-1 /bin/bash
cd /var/lib/postgresql/scripts
./replace-dev-with-prod.sh
```

#### Admin Site

1. Add yourself to the `app_allowedusers` table before trying to login
2. Load `initial_data/polling_place_facility_types.csv` into `app_pollingplacefacilitytype`
3. Create a test election for yourself and load some polling places into it via the UI (contact the project maintainers for a sample)

### Run both sites

`docker compose up`
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

# Logs

scp -r demsausage:/apps/digitalocean-stack/logs/ .

docker compose logs service_name

docker compose -f docker compose-prod-demsausage.yml logs service_name

# Disk space usage

```
docker image prune -a --filter "until=720h"
```

# Open Graph rich link previews

We're using the [Open Graph](https://ogp.me) standard to show rich link previews for the socials.

For testing, [Social Share Preview](https://socialsharepreview.com) (and its browser extension) are super useful. [MetaTags.io](https://metatags.io) was also useful.

References:

- [Open Graph Spec](https://ogp.me)
- [Twitter Cards Spec](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)

## Outcome

Well that's annoying...it only works locally, not in production. It looks like we need SSR and all of that jazz for the dynamic react-helmet tags to work.

And it doesn't work because the search engine crawlers don't execute JavaScript.

Don't know why it worked locally, but maybe create-react-app is doing something fancy?

So, what are our options?

1. Use Next.js
2. Use a service like https://prerender.io
3. Roll our own little server like https://blog.logrocket.com/adding-dynamic-meta-tags-react-app-without-ssr/

References:

- https://stackoverflow.com/a/55888431
- https://stackoverflow.com/a/70796399
- https://stackoverflow.com/a/62559163
- https://www.indiehackers.com/post/solved-react-app-with-dynamic-meta-tags-without-ssr-cdda6da385 (see the comment by RBouschery)

## Clearing the cached images

General instructions: https://www.socialmediaexaminer.com/how-to-clear-facebook-cache-twitter-cache-linkedin-cache/

- Twitter: https://cards-dev.twitter.com/validator
- Facebook: https://developers.facebook.com/tools/debug/sharing/

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

# Maintenance

## PostgreSQL upgrades

The lazy "Eh, just dump everything and reload it rather than trying to upgrade it" approach.

1. Navigate to the shared scripts directory `/var/lib/postgresql/scripts`
2. Dump the current database with `pg_dumpall -U postgres > dumpfile`
3. Stop the old container
4. Rename the old `data` directory
5. Start the new container
6. Import the dump into the new container with `psql -U postgres < dumpfile`
7. Follow any specific steps for this upgrade (e.g. the `PostgreSQL 10.7 to 15 upgrade` section below)
8. ...
9. Profit!

### PostgreSQL 10.7 to 15 upgrade

Performed on 30 October, 2022.

Had to run through [these steps](https://www.crunchydata.com/blog/how-to-upgrade-postgresql-passwords-to-scram) to change the password authentication method being used.
