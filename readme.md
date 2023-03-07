# Exchenge App

## Execute backend in docker
run `docker compose -f docker-compose.yml up --build`

## Execute frontend in docker
run `docker compose -f docker-compose.yml up --build` in the '\exchange-app' folder

## Run on your PC 

### Setup for backend
run `npm install` in the project folder

### Setup for frontend
run `npm install` in the '\exchange-app' folder

### Execute backend
open 3 terminals, execute:
- exchange microservice: `npm run exchange`
- users microservice: `npm run users`
- api microservice: `npm run api`

### Execute frontend in dev
run `npm run dev` in the '\exchange-app' folder

### Execute frontend in prod
run `npm run start` in the '\exchange-app' folder

