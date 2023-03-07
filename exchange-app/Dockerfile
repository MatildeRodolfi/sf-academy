FROM node:latest
ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN apt-get update && apt-get -y install default-jre
RUN npm install --production

