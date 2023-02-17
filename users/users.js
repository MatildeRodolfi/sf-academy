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
        pool.query(query, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(results);
        })
    })
}

/** UPDATE COUNTS - aggiornamento valore di conti con passaggio tra uno e l'altro*/
function updateCounts(email, from, to, valueFrom, valueTo){
    return new Promise(function(resolve, reject) {
        var query = ' DO $$ '+
            'BEGIN ' +
            'IF (SELECT '+from+' FROM users WHERE email=\''+email+'\')>='+valueTo+' THEN ' +
            'UPDATE users SET '+
            to+' = '+valueTo+'+(SELECT '+to+' FROM users WHERE email=\''+email+'\' FOR UPDATE), '+
            from+' = -'+valueFrom+'+(SELECT '+from+' FROM users WHERE email=\''+email+'\' FOR UPDATE) '+
            'WHERE email=\''+email+'\';'+
            'ELSE '+
            'SELECT (1 / 0); '+
            'END IF;'+
            'END $$;';
        pool.query(query, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(results);
        })
    })
}

/** SAVE TRANSACTION - salvataggio dati della transazione sul db*/
function saveTransaction(email, from, to, value, rate){
    return new Promise(function(resolve, reject) {

        var query = 'INSERT INTO transaction (mail, "to", "from", value, date, rate) VALUES ('
            +'\''+email+'\', '
            +'\'{'+to+'}\', '
            +'\'{'+from+'}\', '
            +''+value+', '
            +'current_timestamp, '
            +''+rate+')';
        pool.query(query, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
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
        .then(response => {
            console.log('deposit - update count into db');

            saveTransaction(call.request.email, 'IBAN', call.request.symbol, call.request.value, 0)
            .then(response => {
                console.log('deposit - save deposit transaction into db');
            })
            .catch(error => {
                console.log("deposit - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with db",
                    status: grpc.status.INTERNAL
                });
            });
        })
        .catch(error => {
            console.log("deposit - internal error with db");
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
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token){
            console.log("withdraw - invalid input");
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
                console.log("withdraw - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INTERNAL
                });
            }
            console.log("withdraw - internal error");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }

        if (call.request.symbol!="EUR" && call.request.symbol!="USD"){
            console.log("withdraw - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INTERNAL
            });
        }

        if (call.request.value<=0){
            console.log("withdraw - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }

        updateCount(call.request.email, call.request.symbol, (call.request.value*-1))
        .then(response => {
            console.log('withdraw - update count into db');

            saveTransaction(call.request.email, call.request.symbol, 'IBAN', call.request.value, 0)
            .then(response => {
                console.log('save withdraw transaction into db');
            })
            .catch(error => {
                console.log("withdraw - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with db",
                    status: grpc.status.INTERNAL
                });
            });
        })
        .catch(error => {
            console.log("withdraw - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });

        

        return callback()
    },

    /** BUY - sposta una determinata quantità da un conto all'altro applicando il tasso di cambio*/
    buy: (call, callback) =>{
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token){
            console.log("buy - invalid input");
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
                console.log("buy - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INTERNAL
                });
            }
            console.log("buy - internal error");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }

        if (call.request.symbol!="EUR" && call.request.symbol!="USD"){
            console.log("buy - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INTERNAL
            });
        }

        if (call.request.value<=0){
            console.log("buy - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }
        
        var to = call.request.symbol;
        var from = 'EUR';
        if (to =='EUR'){
            from = 'USD';
        }

        const descriptorExchange = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/exchange.proto")))
        const grpcClient = new descriptorExchange.greeter.Greeter("0.0.0.0:9000", grpc.credentials.createInsecure())
    
        grpcClient.exchange({value: call.request.value, from: to, to: from}, (err, data) => {
            if (err){
                console.log("Error with exchange")
                data = 0
            }
            var valuesFrom = data.value
            console.log(valuesFrom)
            
            updateCounts(call.request.email, from, call.request.symbol, valuesFrom, call.request.value) 
            .then(response => {
                console.log('buy - update counts into db');

                saveTransaction(call.request.email, from, call.request.symbol, call.request.value, data.rate)
                .then(response => {
                    console.log('save buy transaction into db');
                    return callback();
                })
                .catch(error => {
                    console.log("buy - internal error with db");
                    return callback({
                        code: 500,
                        message: "internal error with db",
                        status: grpc.status.INTERNAL
                    });
                });
            })
            .catch(error => {
                if (error.code==22012){
                    console.log("buy - not enought");
                    return callback({
                        code: 400,
                        message: "user not have enought for buy",
                        status: grpc.status.INTERNAL
                    });
                }
                else{
                    console.log("buy - internal error with db");
                    return callback({
                        code: 500,
                        message: "internal error with db",
                        status: grpc.status.INTERNAL
                    });
                }
            });
        })
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
