"""gunicorn WSGI server configuration."""
from multiprocessing import cpu_count
from os import environ


def max_workers():
    return (2 * cpu_count()) + 1


bind = "0.0.0.0:" + environ.get("PORT", "8000")
max_requests = 15000
worker_class = "gevent"
workers = max_workers()
forwarded_allow_ips = "*"
loglevel = "info"
pythonpath = "/env/lib/python3.6/site-packages"
timeout = 3600
