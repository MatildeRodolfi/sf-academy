const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
import jwt from "jsonwebtoken";
import crypt from "crypto";
import { join } from "path";
import { promisify } from "util";
import { config } from './config/config';
const Pool = require('pg').Pool;
import { usersServiceHandlers } from './proto/build/usersPackage/usersService';
import { ProtoGrpcType } from './proto/build/users';

/** dati di accesso al db */
const pool = new Pool(config.db);

/** HASHING PASSWORD - cripta la pw e restituisce hash e salt*/
function hashingPassword(password:string) { 
    var salt:string = crypt.randomBytes(16).toString('hex'); 
    var pw:string = crypt.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
    return {salt, pw}
}; 

/** VALID PASSWORD - verifica che la pw inserita sia corretta*/
function validPassword (password:string, hash:string, salt:string) { 
    var newhash:string = crypt.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return newhash === hash; 
}; 


/** SAVE USER - salvataggio dati utente su db*/
function saveUser(email:string, name:string, iban:string, salt:string, pw:string){
    return new Promise(function(resolve, reject) {

        var query = 'INSERT INTO users (email, name, iban, password, salt) VALUES ($1, $2, $3, $4, $5)'; 
        pool.query(query, [email, name, iban, pw, salt], (error:any, results:any) => {
            if (error) {
                reject(error);
            }
            console.log('user save into db');
            resolve(results);
        })
    })
}

/** GET PASSWORD AND SALT OF USER - restituisce hash e salt dell'utente dal db*/
function getPasswordAndSaltOfUser(email:string){
    return new Promise(function(resolve, reject) {

        var query = 'SELECT password, salt FROM users WHERE email = $1'; 
        pool.query(query, [email], (error:any, results:any) => {
            if (error) {
                reject(error);
            }
            console.log('get user\'s hash and salt from db');
            resolve(results.rows);
        })
    })
}

/** GET PASSWORD AND SALT OF USER - restituisce valori dei conti dell'utente dal db*/
function getCountsValue(email:string){
    return new Promise(function(resolve, reject) {

        var query = 'SELECT eur, usd FROM users WHERE email = $1'; 
        pool.query(query, [email], (error:any, results:any) => {
            if (error) {
                reject(error);
            }
            resolve(results.rows);
        })
    })
}

/** UPDATE COUNTS - aggiornamento valore di conti con passaggio tra uno e l'altro*/
function updateCounts(email:string){
    return new Promise(function(resolve, reject) { //TODO
        var query:string = 'UPDATE users SET ' +
        'eur = ( ' +
        '    COALESCE((SELECT SUM(value) FROM transactions WHERE mail = $1 AND "to" = \'EUR\'), 0)+ ' +
        '    COALESCE((SELECT SUM(value*-1) FROM transactions WHERE mail = $1 AND "from" = \'EUR\' AND "to"=\'IBAN\'), 0)+ ' +
        '    COALESCE((SELECT SUM(value/rate*-1) FROM transactions WHERE mail = $1 AND "from" = \'EUR\' AND "to"!=\'IBAN\'), 0) ' +
        '), ' +
        'usd = ( ' +
        '    COALESCE((SELECT SUM(value) FROM transactions WHERE mail = $1 AND "to" = \'USD\'), 0)+ ' +
        '    COALESCE((SELECT SUM(value*-1) FROM transactions WHERE mail = $1 AND "from" = \'USD\' AND "to"=\'IBAN\'), 0)+ ' +
        '    COALESCE((SELECT SUM(value*rate*-1) FROM transactions WHERE mail = $1 AND "from" = \'USD\' AND "to"!=\'IBAN\'), 0) ' +
        ') ' +
        'WHERE (users.email = $1)';

        console.log("here")
        
        pool.query(query, [email], (error:any, results:any) => {
            if (error) {
                reject(error);
            }
            if (results.rowCount===0) {
                console.log("results.rowCount=0");
                reject(results);
            }
            resolve(results);
        })
    })
}

/** SAVE TRANSACTION - salvataggio dati della transazione sul db*/
function saveTransaction(email:string, from:string, to:string, value:number, rate:number){
    return new Promise(function(resolve, reject) {

        var query = 'INSERT INTO transactions (mail, "to", "from", value, date, rate) VALUES ($1, $2, $3, $4, current_timestamp, $5)';
        pool.query(query, [email, to, from, value, rate], (error:any, results:any) => {
            if (error) {
                reject(error);
            }
            resolve(results);
        })
    })
}

/** FIND TRANSACTIONS - estrazione transazione dell'utente che rispettano i filtri applicati*/
function findTransactions(email:string, from:string, to:string, valueMin:number, valueMax:number, dateMin:string, dateMax:string, rateMin:number, rateMax:number){
    return new Promise(function(resolve, reject) {
        var query = 'SELECT * FROM transactions WHERE mail=$1';
        var values:Array<any> = [email];
        var i=2;
        if (from){
            query += ' AND transactions.from=$'+i;
            values.push(from);
            i++;
        }
        if (to){
            query += ' AND transactions.to=$'+i;
            values.push(to);
            i++;
        }
        if (valueMin){
            query += ' AND transactions.value>=$'+i;
            values.push(valueMin);
            i++;
        }
        if (valueMax){
            query += ' AND transactions.value<=$'+i;
            values.push(valueMax);
            i++;
        }
        if (dateMin){
            query += ' AND transactions.date>=$'+i;
            values.push(dateMin);
            i++;
        }
        if (dateMax){
            query += ' AND transactions.date<=$'+i;
            values.push(dateMax);
            i++;
        }
        if (rateMin){
            query += ' AND transactions.rate>=$'+i;
            values.push(rateMin);
            i++;
        }
        if (rateMax){
            query += ' AND transactions.rate<=$'+i;
            values.push(rateMax);
            i++;
        }

        pool.query(query, values, (error:any, results:any) => {
            if (error) {
                reject(error);
            }
            resolve(results.rows);
        })
    })
}



/** CREATE TOKEN - crea il il token JWT partendo dalla mail dell'utente*/
function createToken(mail:string){
    var token = jwt.sign({ mail: mail }, config.jwtKey, {
        algorithm: "HS256",
        expiresIn: +config.jwtExpirySeconds
    });
    return { token: token, maxAge: (+config.jwtExpirySeconds)*1000 };
}



const implementations:usersServiceHandlers = {

    /** SIGNUP -  salva l'utente sul db e restituisce il token JWT*/
    signup: (call:any, callback:any) => {

        if (!call.request.email || !call.request.password || !call.request.name || !call.request.iban){
            console.log("signup - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        var {salt, pw} = hashingPassword(call.request.password);
        
        saveUser(call.request.email, call.request.name, call.request.iban, salt, pw)
        .then(() => {
            var {token, maxAge} = createToken(call.request.email);

            return callback(null, {
                token: token,
                maxAge: maxAge
            })
        })
        .catch(error => {
            if (error.rowCount===0 || error.code=='23505'){
                console.log("signup - duplicate email");
                return callback({
                    code: 409,
                    message: "duplicate record: user with this email already exists",
                    status: grpc.status.ALREADY_EXISTS
                });
            }
            else{
                console.log("signup - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error",
                    status: grpc.status.INTERNAL
                });
            }
            
        })   
    },

    /** LOGIN -  controlla dati utente e restituisce il token JWT*/
    login: (call:any, callback:any) => {

        if (!call.request.email || !call.request.password){
            console.log("login - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }
        
        getPasswordAndSaltOfUser(call.request.email)
        .then((response:any) => {
            if (!response[0]){
                console.log("login - wrong user");
                return callback({
                    code: 401,
                    message: "wrong user",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }

            var pw:string = response[0].password;
            var salt:string = response[0].salt;

            if (! validPassword(call.request.password, pw, salt)){
                console.log("login - wrong password");
                return callback({
                    code: 401,
                    message: "wrong password",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            
            console.log("user authenticated");
            var {token, maxAge}= createToken(call.request.email);

            return callback(null, {
                token: token,
                maxAge: maxAge
            })
            
        })
        .catch(() => {
            console.log("login - internal error with db");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        })   
    },

    /** REFRESH TOKEN -  rigenera il token JWT, controllando se è un token corretto e che sia in scadenza*/
    refreshToken: (call:any, callback:any) =>{
        if (!call.request.email) {
            console.log("refreshToken - empty email");
            return callback({
                code: 400,
                message: "empty email",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (!call.request.token) {
            console.log("refreshToken - empty token");
            return callback({
                code: 400,
                message: "empty token",
                status: grpc.status.INVALID_ARGUMENT
            });
        }
    
        var payload: string|jwt.JwtPayload;
        try {
            payload = jwt.verify(call.request.token, config.jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("refreshToken - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            console.log("refreshToken - internal error with jwt verify");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }
        const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
        
        const { exp } = payload as jwt.JwtPayload
        if (exp - nowUnixSeconds > 30) {
            console.log("refreshToken - too early");
            return callback({
                code: 400,
                message: "have to wait more before ask to refresh token",
                status: grpc.status.FAILED_PRECONDITION
            });
        }
    
        var {token, maxAge} = createToken(call.request.email);
        console.log("token refreshed");
        return callback(null, {
            token: token,
            maxAge: maxAge
        })
    },

    /** GET COUNTS - restituisce i valori dei conti dell'utente*/
    getCounts: (call:any, callback:any) =>{
        if (!call.request.email) {
            console.log("getCounts - empty email");
            return callback({
                code: 400,
                message: "empty email",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (!call.request.token) {
            console.log("getCounts - empty token");
            return callback({
                code: 400,
                message: "empty token",
                status: grpc.status.INVALID_ARGUMENT
            });
        }
    
        var payload: string|jwt.JwtPayload;
        try {
            payload = jwt.verify(call.request.token, config.jwtKey);
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("getCounts - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            console.log("getCounts - internal error with jwt verify");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }
        
        getCountsValue(call.request.email)
        .then((response:any) => {

            console.log('getCounts - get counts value from db');
            
            return callback(null, {
                eur: response[0].eur,
                usd: response[0].usd
            })
        })
        .catch(() => {
            console.log("getCounts - internal error with db");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        });
    },

    /** DEPOSIT - deposito sul conto dell'utente di una somma nella valuta scelta*/
    deposit: (call:any, callback:any) =>{
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token){
            console.log("deposit - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        try { 
            jwt.verify(call.request.token, config.jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("deposit - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            console.log("deposit - internal error with jwt verify");
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
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.value<=0){
            console.log("deposit - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        saveTransaction(call.request.email, 'IBAN', call.request.symbol, call.request.value, 0)
        .then(() => {
            console.log('deposit - save transaction into db');

            updateCounts(call.request.email)
            .then(() => {
                console.log('deposit - update counts into db');
                return callback();
            })
            .catch(() => {
                console.log("deposit - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error",
                    status: grpc.status.INTERNAL
                });
            });
        })
        .catch(() => {
            console.log("deposit - internal error with db");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        });
    },

    /** WITHDRAW - prelievo dal conto dell'utente di una somma nella valuta scelta*/
    withdraw: (call:any, callback:any) =>{
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token){
            console.log("withdraw - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }
        
        try { 
            jwt.verify(call.request.token, config.jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("withdraw - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            console.log("withdraw - internal error with jwt verify");
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
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.value<=0){
            console.log("withdraw - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        saveTransaction(call.request.email, call.request.symbol, 'IBAN', call.request.value, 0)
        .then(() => {
            console.log('withdraw - save transaction into db');

            updateCounts(call.request.email)
            .then(() => {
                console.log('withdraw - update counts into db ');
                return callback();
            })
            .catch(() => {
                console.log("withdraw - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error",
                    status: grpc.status.INTERNAL
                });
            });
        })
        .catch(error => {
            if (error.rowCount===0){
                console.log("withdraw - not enought");
                return callback({
                    code: 400,
                    message: "not have enought",
                    status: grpc.status.FAILED_PRECONDITION
                });
            }
            else{
                console.log("withdraw - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error",
                    status: grpc.status.INTERNAL
                });
            }
        });
    },

    /** BUY - sposta una determinata quantità da un conto all'altro applicando il tasso di cambio*/
    buy: (call:any, callback:any) =>{
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token){
            console.log("buy - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.symbol!="EUR" && call.request.symbol!="USD"){
            console.log("buy - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.value<=0){
            console.log("buy - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        try {
            jwt.verify(call.request.token, config.jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("buy - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            console.log("buy - internal error with jwt verify");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }
        
        var to:string = call.request.symbol;
        var from:string = 'EUR';
        if (to =='EUR'){
            from = 'USD';
        }

        
        const descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/exchange.proto")));
        const grpcClient = new descriptor.exchangePackege.ExchangeService(config.exchangeHost+":"+config.exchangePort, grpc.credentials.createInsecure());
        
        //from e to sono invertiti perchè dobbiamo calcolare il quantitativo in valuta "to" dato il valore dato in valuta "from" (il cliente mette il quantitativo di quello che vuole acquistare e siamo noi a calcolare quanto costa)
        grpcClient.exchange({value: call.request.value, from: to, to: from}, (err:any, data:any) => {
            if (err){
                console.log("exchange error: "+err)
                data = 0
                return callback({
                    code: 500,
                    message: "internal error",
                    status: grpc.status.INTERNAL
                });
            }

            var valuesFrom:number = data.value
            
            saveTransaction(call.request.email, from, call.request.symbol, call.request.value, data.rate) 
            .then(() => {
                console.log('buy - save transaction into db');

                updateCounts(call.request.email)
                .then(() => {
                    console.log('buy - update counts into db');
                    return callback();
                })
                .catch(() => {
                    console.log("buy - internal error with db");
                    return callback({
                        code: 500,
                        message: "internal error",
                        status: grpc.status.INTERNAL
                    });
                });
            })
            .catch(error => {
                if (error.rowCount===0){
                    console.log("buy - not enought");
                    return callback({
                        code: 400,
                        message: "not have enought",
                        status: grpc.status.INTERNAL
                    });
                }
                else{
                    console.log("buy - internal error with db");
                    return callback({
                        code: 500,
                        message: "internal error",
                        status: grpc.status.INTERNAL
                    });
                }
            });
        })
    },

    /** LIST TRANSACTIONS - restituisce la lista di transazioni di un utente con la possiblità di filtrarle */
    listTransactions: (call:any, callback:any) =>{ 
        if (!call.request.email || !call.request.token){
            console.log("listTransactions - empty required input");
            return callback({
                code: 400,
                message: "one or more empty required input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.valueMin && call.request.valueMax && call.request.valueMax<call.request.valueMin){
            console.log("listTransactions - valueMax<valueMin");
            return callback({
                code: 400,
                message: "valueMax<valueMin",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.dateMin && call.request.dateMax && call.request.dateMax<call.request.dateMin){
            console.log("listTransactions - dateMax<dateMin");
            return callback({
                code: 400,
                message: "dateMax<dateMin",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.rateMin && call.request.rateMax && call.request.rateMin<call.request.rateMax){
            console.log("listTransactions - rateMin<rateMax");
            return callback({
                code: 400,
                message: "rateMin<rateMax",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if ((call.request.from && call.request.from!="EUR" && call.request.from!="USD" && call.request.from!="IBAN")||(call.request.to && call.request.to!="EUR" && call.request.to!="USD" && call.request.to!="IBAN")){
            console.log("listTransactions - invalid to/from symbol");
            return callback({
                code: 400,
                message: "symbol to/from not correct",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        if (call.request.value<=0){
            console.log("listTransactions - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        try {
            jwt.verify(call.request.token, config.jwtKey)
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                console.log("listTransactions - wrong token");
                return callback({
                    code: 401,
                    message: "wrong token",
                    status: grpc.status.INVALID_ARGUMENT
                });
            }
            console.log("listTransactions - internal error with jwt verify");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        }

        findTransactions(call.request.email, call.request.from, call.request.to, call.request.valueMin, call.request.valueMax, call.request.dateMin, call.request.dateMax, call.request.rateMin, call.request.rateMax)
        .then(response => {
            console.log('listTransactions - get list from db');
            return callback(null, {
                response: JSON.stringify(response)
            });
        })
        .catch(() => {
            console.log("listTransactions - internal error with db");
            return callback({
                code: 500,
                message: "internal error",
                status: grpc.status.INTERNAL
            });
        });
    }
}



/** avvio users grpc server */
const descriptorUsers = (grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto"))) as unknown) as ProtoGrpcType
const server = new grpc.Server()
server.bindAsync = promisify(server.bindAsync)
server.bindAsync('0.0.0.0:'+ config.usersPort, grpc.ServerCredentials.createInsecure(), ()=>{
    server.addService(descriptorUsers.usersPackage.usersService.service, implementations);
    server.start();
    console.log("users grpc server started on port "+ config.usersPort)
})