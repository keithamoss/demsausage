#!/bin/bash

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting cron job"
/usr/local/bin/python /app/demsausage/app/sausage/cron/cron.py
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cron job completed"