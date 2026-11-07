FROM python:3.10-slim-bookworm
LABEL maintainer="<keithamoss@gmail.com>"

# Python
ENV PYTHONUNBUFFERED=1 \
  # Prevents Python from creating .pyc files
  PYTHONDONTWRITEBYTECODE=1 \
  \
  # Django
  DJANGO_SETTINGS_MODULE="demsausage.settings"

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

WORKDIR /app

# Keep the dependency manager pinned and use the committed lock for the runtime set.
COPY --from=ghcr.io/astral-sh/uv:0.8.15 /uv /uvx /bin/
COPY pyproject.toml uv.lock ./
RUN uv lock --check && \
  uv export --locked --no-dev --no-emit-project --format requirements.txt \
    --output-file /tmp/requirements.txt && \
  uv pip install --python /usr/local/bin/python --require-hashes \
    --no-deps -r /tmp/requirements.txt && \
  rm /tmp/requirements.txt

COPY . /app
# Keep the project importable by django-admin and editable through the /app source mount.
RUN uv pip install --python /usr/local/bin/python --no-deps --editable /app
# This generated cron export contains the runtime environment and must not enter the image.
RUN test ! -e /app/demsausage/app/sausage/cron/demsausage.cron.env

RUN apt-get remove -y --purge wget && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/app/docker-entrypoint.sh"]
