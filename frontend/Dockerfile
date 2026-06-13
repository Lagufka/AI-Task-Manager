FROM node:24-alpine as base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY ./public ./public
COPY ./src ./src
COPY ./vite.config.js ./
COPY ./index.html ./

### ================================= ###

FROM base as build

RUN npm run build

### ================================= ###

FROM base as development

COPY ./eslint* ./

CMD ["npm", "run", "dev"]

### ================================= ###

FROM caddy:2.11.4-alpine as production

COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=build /app/dist /usr/share/caddy

