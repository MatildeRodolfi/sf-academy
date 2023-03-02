const env = process.env;

const config = {
  db: { 
    user: env.DB_USER || 'my_user',      
    host: env.DB_HOST || 'localhost',  
    database: env.DB_NAME || 'exchange',  
    password: env.DB_PASSWORD || 'root',
    port:  env.DB_PORT || 5432
  },
  usersIP: env.USERS_HOST || 'localhost',
  exchangeIP: env.EXCHANGE_HOST || 'localhost'
};

module.exports = config;