# Exchenge App

## Setup for backend
run `npm install` in the project folder
run `npm run build` to build the api interface

## Setup for frontend
run `npm install` in the '\exchange-app' folder

## Execute backend in dev
open 3 terminals, execute:
- exchange microservice: `npm run dev-exchange`
- users microservice: `npm run dev-users`
- api microservice: `npm run dev-api`

## Execute backend in prod
open 3 terminals, execute:
- exchange microservice: `npm run exchange`
- users microservice: `npm run users`
- api microservice: `npm run api`

## Execute backend in docker
run `docker compose -f docker-compose.yml up --build`

## Execute frontend in dev
run `npm run dev` in the '\exchange-app' folder

## Execute frontend in prod
run `npm run start` in the '\exchange-app' folder

## Execute frontend in docker
run `docker compose -f docker-compose.yml up --build` in the '\exchange-app' folder