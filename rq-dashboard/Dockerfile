FROM python:3.9-slim
LABEL maintainer="<keithamoss@gmail.com>"

ENV PYTHONUNBUFFERED=1 \
	PIP_NO_CACHE_DIR=1

# Minimal OS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
	  ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Install rq-dashboard and pin rq for compatibility
RUN pip install --no-cache-dir rq-dashboard rq==1.10.1

# Add local files (entrypoint script)
ADD . /app
WORKDIR /app

EXPOSE 9181
ENTRYPOINT ["/app/docker-entrypoint.sh"]