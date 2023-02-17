const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")//TODO trovare buil-in Node module for this
const { join } = require("path")
const { promisify } = require("util")
const PORT = 9001
const jwtKey = "dF3OzQ49J0"
const jwtExpirySeconds = 300



/** HASHING PASSWORD - cripta la pw e restituisce hash e salt*/
function hashingPassword(password) { 
    salt = crypto.randomBytes(16).toString('hex'); 
    pw = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 

    return {salt, pw}
}; 

/** VALID PASSWORD - verifica che la pw inserita sia corretta*/
function validPassword (password, hash, salt) { 
    var newhash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
    return newhash === hash; 
}; 



/** dati di accesso alla db */
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'my_user',
  host: 'localhost',
  database: 'exchange',
  password: 'root',
  port: 5432,
});

/** SAVE USER - salvataggio dati utente su db*/
function saveUser(email, name, iban, salt, pw){
    return new Promise(function(resolve, reject) {

        var query = 'INSERT INTO users (email, name, iban, password, salt) VALUES ('
            +'\''+email+'\', '
            +'\''+name+'\', '
            +'\''+iban+'\', '
            +'\''+pw+'\', '
            +'\''+salt+'\')'; 
        pool.query(query, (error, results) => {
            if (error) {
                reject(error);
                console.log(error);
            }
            else{
                console.log('user save into db');
            }
            resolve(results);
        })
    })
}

/** GET PASSWORD AND SALT OF USER - restituisce hash e salt dell'utente dal db*/
function getPasswordAndSaltOfUser(email){
    return new Promise(function(resolve, reject) {

        var query = 'SELECT password, salt FROM users WHERE email=\''+email+'\''; 
        pool.query(query, (error, results) => {
            if (error) {
                reject(error);
                console.log(error);
            }
            else{
                console.log('get user\'s hash and salt from db');
            }
            resolve(results.rows);
        })
    })
}

/** UPDATE COUNT - aggiornamento valore del conto */
function updateCount(email, symbol, value){
    return new Promise(function(resolve, reject) {
        var query = 'UPDATE users SET '+symbol+' = '+value+
            '+(SELECT '+symbol+' FROM users WHERE email=\''+email+'\' FOR UPDATE)'+
            'WHERE email=\''+email+'\'';
        console.log(query);
        pool.query(query, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            else{
                console.log('update count into db');
            }
            resolve(results);
        })
    })
}

/** SAVE TRANSACTION - salvataggio dati della transazione sul db*/
function saveTransaction(email, to, from, value){
    return new Promise(function(resolve, reject) {

        var query = 'INSERT INTO transaction (mail, "to", "from", value) VALUES ('
            +'\''+email+'\', '
            +'\'{'+to+'}\', '
            +'\'{'+from+'}\', '
            +''+value+')'; 
        console.log(query);
        pool.query(query, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            else{
                console.log('user transaction into db');
            }
            resolve(results);
        })
    })
}



/** CREATE TOKEN - crea il il token JWT partendo dalla mail dell'utente*/
function createToken(mail){
    const token = jwt.sign({mail}, jwtKey, {
		algorithm: "HS256",
		expiresIn: jwtExpirySeconds,
	})

    return {token: token, maxAge: jwtExpirySeconds * 1000}
}



/** GET EXCHANGE - restituisce il valore di cambio comunicando con il server grpc exchange */
function getExchange(value, from, to){
    const descriptorExchange = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/exchange.proto")))
    const grpcClient = new descriptorExchange.greeter.Greeter("0.0.0.0:9000", grpc.credentials.createInsecure())
    
    grpcClient.exchange({value: value, from: from, to: to}, (err, data) => { //TODO probabilmente è asicrono quindi non funziona
        if (err){
            console.log("Error with exchange")
            data = 0
        }

        return data;
    })
}



const implementations = {

    /** SIGNUP -  salva l'utente sul db e restituisce il token JWT*/
    signup: (call, callback) => {

        if (!call.request.email || !call.request.password || !call.request.name || !call.request.iban){
            console.log("signup - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }

        var {salt, pw} = hashingPassword(call.request.password);
        
        saveUser(call.request.email, call.request.name, call.request.iban, salt, pw)
        .then(response => {
            var {token, maxAge}= createToken(call.request.email);

            return callback(null, {
                token: token,
                maxAge: maxAge
            })
        })
        .catch(error => {
            if (error.code==23505){
                console.log("signup - duplicate email");
                return callback({
                    code: 409,
                    message: "duplicate record: user with this email already exists",
                    status: grpc.status.INTERNAL
                });
            }
            else{
                console.log("signup - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with insert into db",
                    status: grpc.status.INTERNAL
                });
            }
            
        })   
    },

    /** LOGIN -  controlla dati utente e restituisce il token JWT*/
    login: (call, callback) => {

        if (!call.request.email || !call.request.password){
            console.log("login - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        
        getPasswordAndSaltOfUser(call.request.email)
        .then(response => {
            
            var pw = response[0].password;
            var salt = response[0].salt;

            if (validPassword(call.request.password, pw, salt)){

                console.log("user authenticated");
                var {token, maxAge}= createToken(call.request.email);

                return callback(null, {
                    token: token,
                    maxAge: maxAge
                })
            }
            
            console.log("login - wrong password");
            return callback({
                code: 401,
                message: "wrong password",
                status: grpc.status.INTERNAL
            });
            
        })
        .catch(error => {
            console.log("login - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        })   
    },

    /** REFRESH TOKEN -  rigenera il token JWT, controllando se è un token corretto e che sia in scadenza*/
    refreshToken: (call, callback) =>{
        if (!call.request.email) {
            console.log("refreshToken - empty email");
            return callback({
                code: 400,
                message: "empty email",
                status: grpc.status.INTERNAL
            });
        }

        if (!call.request.token) {
            console.log("refreshToken - empty token");
            return callback({
                code: 401,
                message: "empty token",
                status: grpc.status.INTERNAL
            });
        }
    
        var payload
        try {
            payload = jwt.verify(call.request.token, jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("refreshToken - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INTERNAL
                });
            }
            console.log("refreshToken - internal error");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }
        const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
        if (payload.exp - nowUnixSeconds > 30) {
            console.log("refreshToken - too early");
            return callback({
                code: 400,
                message: "have to wait more before ask to refresh token",
                status: grpc.status.INTERNAL
            });
        }
    
        var {token, maxAge} = createToken(call.request.email);
        onsole.log("token refreshed");
        return callback(null, {
            token: token,
            maxAge: maxAge
        })
    },

    /** DEPOSIT - deposito sul conto dell'utente di una somma nella valuta scelta*/
    deposit: (call, callback) =>{
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token){
            console.log("deposit - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }

        try {
            jwt.verify(call.request.token, jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("deposit - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INTERNAL
                });
            }
            console.log("deposit - internal error");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }

        if (call.request.symbol!="EUR" && call.request.symbol!="USD"){
            console.log("deposit - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INTERNAL
            });
        }

        if (call.request.value<=0){
            console.log("deposit - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }

        updateCount(call.request.email, call.request.symbol, call.request.value)
        .catch(error => {
            console.log("login - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });

        saveTransaction(call.request.email, call.request.symbol, 'IBAN', call.request.value)
        .catch(error => {
            console.log("login - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });

        return callback()
    },

    /** WITHDRAW - prelievo dal conto dell'utente di una somma nella valuta scelta*/
    withdraw: (call, callback) =>{
        
    },

    buy: (call, callback) =>{
        
    },

    listTransactions: (call, callback) =>{
        
    }
}

/** avvio users grpc server */
const descriptorUsers = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto")))
const server = new grpc.Server()
server.bindAsync = promisify(server.bindAsync)
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure())
  .then(() => {
    server.addService(descriptorUsers.greeter.Greeter.service, implementations)
    server.start()
    console.log("users grpc server started on port %O", PORT)
  })
  .catch(console.log)
