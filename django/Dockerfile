FROM python:3.8-slim-buster
LABEL maintainer="<keithamoss@gmail.com>"

# Python
ENV PYTHONUNBUFFERED=1 \
  # Prevents Python from creating .pyc files
  PYTHONDONTWRITEBYTECODE=1 \
  \
  # Poetry
  # https://python-poetry.org/docs/configuration/#using-environment-variables
  # Make poetry install to this location
  POETRY_HOME="/opt/poetry" \
  # Prevent poetry from creating a virtual environment
  POETRY_VIRTUALENVS_CREATE=false \
  # Do not ask any interactive question
  POETRY_NO_INTERACTION=1 \
  \
  # Django
  DJANGO_SETTINGS_MODULE="demsausage.settings"

# prepend poetry to path
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y supervisor gdal-bin 
RUN apt-get install -y nano cron
RUN apt-get install -y firefox-esr

ADD . /app
WORKDIR /app

# Python deps management
RUN apt-get install -y curl
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
RUN poetry update
RUN poetry install --no-dev

RUN apt-get remove -y --purge curl && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/app/docker-entrypoint.sh"]
