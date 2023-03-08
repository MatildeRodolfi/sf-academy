FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ./users .
COPY ./config ./config
COPY ./proto ./proto
COPY ./.env ./.env

RUN npm install --production 