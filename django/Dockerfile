FROM python:3.10-slim-bookworm
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
RUN apt-get install -y firefox-esr wget

# Install geckodriver for the correct architecture
# We manually install geckodriver instead of using webdriver-manager because it has a known bug
# where it downloads x86-64 binaries on ARM64/aarch64 systems (e.g., Raspberry Pi), causing
# "OSError: [Errno 8] Exec format error" when trying to run the binary.
# See: https://github.com/SergeyPirogov/webdriver_manager/issues/616
#      https://github.com/SergeyPirogov/webdriver_manager/issues/702
# This manual installation detects the architecture and downloads the correct binary for both
# amd64 (Intel/AMD) and arm64 (Raspberry Pi) platforms.
RUN ARCH=$(dpkg --print-architecture) && \
  if [ "$ARCH" = "amd64" ]; then \
  GECKODRIVER_ARCH="linux64"; \
  elif [ "$ARCH" = "arm64" ]; then \
  GECKODRIVER_ARCH="linux-aarch64"; \
  else \
  echo "Unsupported architecture: $ARCH" && exit 1; \
  fi && \
  GECKODRIVER_VERSION="v0.35.0" && \
  wget -q "https://github.com/mozilla/geckodriver/releases/download/${GECKODRIVER_VERSION}/geckodriver-${GECKODRIVER_VERSION}-${GECKODRIVER_ARCH}.tar.gz" && \
  tar -xzf "geckodriver-${GECKODRIVER_VERSION}-${GECKODRIVER_ARCH}.tar.gz" -C /usr/local/bin && \
  chmod +x /usr/local/bin/geckodriver && \
  rm "geckodriver-${GECKODRIVER_VERSION}-${GECKODRIVER_ARCH}.tar.gz"

ADD . /app
WORKDIR /app

# Python deps management
RUN apt-get install -y curl
# Using latest Poetry since Python 3.10+ supports modern Poetry versions
RUN curl -sSL https://install.python-poetry.org | python -
# Even though Dependabot takes care of updating packages for us, we still need this for poetry to install without complaining about some packages "not being available at [version]". Whatever!
RUN poetry update
RUN poetry install --only main

RUN apt-get remove -y --purge curl wget && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/app/docker-entrypoint.sh"]
