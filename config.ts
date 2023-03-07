import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

export const config = {
  db: { 
    user: env.DB_USER,      
    host: env.DB_HOST,  
    database: env.DB_NAME,  
    password: env.DB_PASSWORD,
    port:  env.DB_PORT
  },
  apiHost: env.API_HOST,
  apiPort: env.API_PORT,
  usersHost: env.USERS_HOST,
  usersPort: env.USERS_PORT,
  exchangeHost: env.EXCHANGE_HOST,
  exchangePort: env.EXCHANGE_PORT,
  ECBlink: env.ECB_LINK,
  jwtKey: env.JWT_KEY,
  jwtExpirySeconds: env.JWT_EXPIRY_SECONDS
};
