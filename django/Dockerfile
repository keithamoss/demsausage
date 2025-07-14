FROM python:3.9-slim-bullseye
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
RUN curl -sSL https://install.python-poetry.org | python -
# Even though Dependabot takes care of updating packages for us, we still need this for poetry to install without complaining about some packages "not being available at [version]". Whatever!
RUN poetry update
RUN poetry install --only main

RUN apt-get remove -y --purge curl && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/app/docker-entrypoint.sh"]
