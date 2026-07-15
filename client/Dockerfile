FROM node:20-alpine AS build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client .
COPY .env ../.env
RUN npm run build

FROM nginx:1.27-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
