FROM node:14.19-buster-slim AS build
WORKDIR /app
COPY . .
RUN yarn install && npm run build

FROM nginx:1.23.0
WORKDIR /usr/share/nginx/html
COPY --from=build /app/out .
EXPOSE 80