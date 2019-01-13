FROM nginx:1.15.7-alpine
MAINTAINER Keith Moss <keithamoss@gmail.com>

# Copy our local nginx config in
RUN rm -rf /etc/nginx
COPY nginx /etc/nginx

EXPOSE 443

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]

# ADD automatically uncompresses the tgz files for us
ADD build/frontend-public.tgz /frontend-public/
ADD build/frontend-admin.tgz /frontend-admin/
ADD build/django.tgz /frontend/
