FROM nginx:1.23.3-alpine
LABEL maintainer="<keithamoss@gmail.com>"

# Copy our local nginx config in
RUN rm -rf /etc/nginx
COPY nginx /etc/nginx

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]

# ADD automatically uncompresses the tgz files for us
# ADD build/public.tgz /frontend/demsausage/
ADD build/public-legacy/ /frontend/demsausage-public-legacy/
ADD build/public-redesign.tgz /frontend/demsausage-redesign/
# ADD build/admin.tgz /frontend/demsausage-admin/
ADD build/admin-legacy/ /frontend/demsausage-admin-legacy/
ADD build/django.tgz /frontend/demsausage-api/
