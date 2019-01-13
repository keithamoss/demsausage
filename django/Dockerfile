FROM python:3.6-alpine3.8
MAINTAINER Keith Moss <keithamoss@gmail.com>

ENV PYTHONUNBUFFERED 1
ENV VIRTUAL_ENV /env
ENV PYTHON_PIP_VERSION 9.0.1
ENV DJANGO_SETTINGS_MODULE demsausage.settings

RUN pyvenv "$VIRTUAL_ENV" && \
  "$VIRTUAL_ENV"/bin/pip install -U pip==$PYTHON_PIP_VERSION

ENV PATH "$VIRTUAL_ENV"/bin:$PATH

RUN mkdir /app

WORKDIR /app

# Upgrade SetupTools from 28.8 to latest due to a bug installing python-memcached on Python 3.6
# c.f. https://github.com/pypa/setuptools/issues/866
RUN pip3 install -U setuptools

# psycopg2 requires pg_config to be available.
# Installing pg_config takes a little more work on Alpine images.
# Credit: https://stackoverflow.com/a/47871121
RUN apk update
RUN apk add postgresql-libs && apk add --virtual .build-deps gcc musl-dev postgresql-dev && apk add supervisor && rm -rf /var/cache/apk/*

ADD requirements.txt /app/
RUN pip install -r requirements.txt --no-cache-dir
ADD . /app/
RUN pip install -e .
RUN apk --purge del .build-deps gcc musl-dev

ENTRYPOINT ["/app/docker-entrypoint.sh"]
