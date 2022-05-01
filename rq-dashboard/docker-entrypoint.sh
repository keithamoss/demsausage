#!/bin/sh

redis_ready()
{
python << END
import sys
from redis import Redis
try:
  Redis.from_url("$RQ_DASHBOARD_REDIS_URL")
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

waitforredis

echo "[Run] Starting rq_dashboard"
python3 -m rq_dashboard

exec "$@"