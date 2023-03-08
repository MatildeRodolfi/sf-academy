FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ./exchange .
COPY ./config ./config
COPY ./proto/exchange.proto ./proto/exchange.proto
COPY ./.env ./.env

RUN npm install --production 