FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ./API .
COPY ./config ./config
COPY ./proto/users.proto ./proto/users.proto
COPY ./.env ./.env
COPY ./exchange-app/apiDoc.yml ./apiDoc.yml

RUN npm install --production 