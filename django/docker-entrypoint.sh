#!/bin/bash

postgres_ready()
{
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$DB_NAME", user="$DB_USERNAME", password="$DB_PASSWORD", host="$DB_HOST")
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

waitfordb()
{
  until postgres_ready; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done

  >&2 echo "Postgres is up - continuing..."

  sleep 4
}

redis_ready()
{
python << END
import sys
from redis import Redis
try:
  Redis.from_url("$RQ_REDIS_URL")
except redis.exceptions.BusyLoadingError:
  sys.exit(-1)
sys.exit(0)
END
}

waitforredis()
{
  until redis_ready; do
    >&2 echo "Redis is unavailable - sleeping"
    sleep 1
  done

  >&2 echo "Redis is up - continuing..."

  sleep 4
}

CMD="$1"

# python_rq_worker entrypoint (development)
if [ "$CMD" = "python_rq_supervisord" ]; then
  waitfordb
  waitforredis
  echo "[Run] Starting python_rq_supervisord"

  python /app/demsausage/rq/init.py
  /usr/bin/supervisord -c /app/demsausage/rq/supervisord.dev.conf
  exit
fi

# Cron entrypoint (development and production)
if [ "$CMD" != "build" ]; then
  waitfordb

  >&2 echo "Starting crond in the background"
  # Print environment variables for cron to utilise
  # Source: https://stackoverflow.com/a/48651061
  declare -p | grep -Ev 'BASH|BASHOPTS|BASH_VERSINFO|BASHPID|BASH_|EUID|PPID|SHELLOPTS|UID' > /app/demsausage/app/sausage/cron/demsausage.cron.env

  # Add our cronjob
  cat /app/demsausage/app/sausage/cron/crontab.txt >> sausage_cron
  crontab sausage_cron
  rm sausage_cron

  # Ensure we have a place to log to
  mkdir -p /app/logs/cron
  mkdir -p /app/logs/gunicorn
  mkdir -p /app/logs/django
  mkdir -p /app/logs/rq_workers
  mkdir -p /app/logs/supervisord
  mkdir -p /app/logs/webdriver

  # Start crond service
  chmod 755 /app/demsausage/app/sausage/cron/cron.sh
  service cron start
fi

# Supervisord entrypoint (production)
if [ "$CMD" = "supervisord" ]; then
  waitfordb

  django-admin migrate

  /usr/bin/supervisord -c /app/supervisord.conf
  exit
fi

# Build entrypoint (development)
if [ "$CMD" = "build" ]; then
  rm -rf /app/static
  mkdir -p /app/static
  
  django-admin collectstatic --noinput

  cd /app/static && tar czvf /build/django.tgz .
  exit
fi

# Development server (development)
if [ "$ENVIRONMENT" = "DEVELOPMENT" ]; then
  waitfordb
  django-admin migrate
  django-admin runserver "0.0.0.0:8000"
  exit
fi

exec "$@"