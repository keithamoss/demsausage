FROM nginx:1.15.7-alpine
MAINTAINER Keith Moss <keithamoss@gmail.com>

# Copy our local nginx config in
RUN rm -rf /etc/nginx
COPY nginx /etc/nginx

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]