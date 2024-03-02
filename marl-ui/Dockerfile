FROM node:14.16.1-alpine as build
#COPY ./ /app/
WORKDIR /app
USER root

#RUN yarn
#RUN yarn build

FROM nginx

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

#COPY --from=build /app/dist /usr/share/nginx/html
COPY ./dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]