FROM nginx:1.15.7-alpine
MAINTAINER Keith Moss <keithamoss@gmail.com>

# Copy our local nginx config in
RUN rm -rf /etc/nginx
COPY nginx /etc/nginx

EXPOSE 443

# COPY docker-entrypoint.sh /app/docker-entrypoint.sh
# ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]

# ADD automatically uncompresses the tgz files for us
ADD build/scremsong/*.tgz /frontend/scremsong/
ADD build/demsausage/*.tgz /frontend/demsausage/
ADD build/demsausage-redesign/*.tgz /frontend/demsausage-redesign/
ADD build/demsausage-admin/*.tgz /frontend/demsausage-admin/
ADD build/demsausage-api/*.tgz /frontend/demsausage-api/
ADD build/scremsong-api/*.tgz /frontend/scremsong-api/
