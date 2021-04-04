FROM nginx:1.19.7-alpine
LABEL maintainer="<keithamoss@gmail.com>"

# Copy our local nginx config in
RUN rm -rf /etc/nginx
COPY nginx /etc/nginx

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]