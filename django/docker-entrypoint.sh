#!/bin/sh

postgres_ready(){
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

  sleep 8
}

CMD="$1"

if [ "$ENVIRONMENT" != "DEVELOPMENT" ] && [ "$CMD" != "build" ]; then
  waitfordb
  >&2 echo "Starting crond in the background"
  # Add our cronjob
  crontab -l > mycron
  cat /app/demsausage/app/sausage/cron/crontab.txt >> mycron
  crontab mycron
  rm mycron

  # Start crond
  chmod 755 /app/demsausage/app/sausage/cron/cron.sh
  crond
fi

if [ "$ENVIRONMENT" = "DEVELOPMENT" ]; then
  waitfordb
  django-admin migrate
  django-admin runserver "0.0.0.0:8000"
  exit
fi

if [ "$CMD" = "build" ]; then
   export ENVIRONMENT=PRODUCTION

   rm -rf /app/static
   mkdir -p /app/static

   django-admin collectstatic --noinput
   cd /app/static && tar czvf /build/django.tgz . && rm -rf /app/static
   exit
fi

# if [ "$CMD" = "uwsgi" ]; then
#    waitfordb
#    export ENVIRONMENT=PRODUCTION
#    django-admin migrate
#    django-admin collectstatic --noinput
#    chown 1000:1000 /var/log/django.log
#    uwsgi --lazy-apps --uid 1000 --gid 1000 --http-socket :9090 --wsgi demsausage.wsgi --master --processes 8 --threads 8
#    exit
# fi

if [ "$CMD" = "supervisord" ]; then
  waitfordb
  export ENVIRONMENT=PRODUCTION
  django-admin migrate
  /usr/bin/supervisord -c /app/supervisord.conf
  exit
fi

exec "$@"