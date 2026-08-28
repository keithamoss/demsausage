# Staging

$4/month 512mb Ubuntu droplet

# Setting up the server

```
# Docker
apt update
apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt-cache policy docker-ce
apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
# Docker
# General
apt upgrade
# General
> reboot
mkdir /apps && cd /apps
git clone https://github.com/keithamoss/digitalocean-stack
cd digitalocean-stack && mkdir secrets && cd secrets
> add secrets
cd ../
mkdir keys && cd keys
> add keys
cd ../
mkdir logs
echo "cd /apps/digitalocean-stack" >> ~/.bashrc
```

## Secrets

```
sausage-web.env
sausage-db.env
rq-dashboard.env
redis.env
cloudflare.env
```

## Redis

Or it'll complain about some permissions errors.

```
chown 1001:1001 redis
```

# Cloudflare

## New A records

```
staging.democracysausage.org
staging-admin.democracysausage.org
staging-public-redesign.democracysausage.org
staging-rq.democracysausage.org
```

## SSL Certs

```
mkdir keys && cd keys
nano wildcard.democracysausage.org.pem
nano wildcard.democracysausage.org.key
```

**Note:** We can't use `staging.[foboar].democracysausage.org` because the Cloudflare Free plan doesn't cover more than one level of wildcards for Edge Certificates. It'd be at least USD$10/month to upgrade to a plan that allows it.

**Note:** We created a new Origin Server certificate that claims to cover more than the original one when we thought we should use `staging.[foboar].democracysausage.org`, so in practice it really just covers the same domains as the cert in prod and exists to differentiate it from that prod cert.