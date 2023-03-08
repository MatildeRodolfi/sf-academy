export default interface ProcessEnv {
  db: { 
    user: string,      
    host: string,  
    database: string,  
    password: string,
    port: number
  },
  apiHost: string,
  apiPort: number,
  usersHost: string,
  usersPort: number,
  exchangeHost: string,
  exchangePort: number,
  ECBlink: string,
  jwtKey: string,
  jwtExpirySeconds: number
}
