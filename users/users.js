var protoLoader = require("@grpc/proto-loader");
var grpc = require("@grpc/grpc-js");
var jwt = require("jsonwebtoken");
var crypt = require("crypto");
var join = require("path").join;
var promisify = require("util").promisify;
var PORT = 9001;
var jwtKey = "dF3OzQ49J0";
var jwtExpirySeconds = 3000;
var config = require('../config');
/** HASHING PASSWORD - cripta la pw e restituisce hash e salt*/
function hashingPassword(password) {
    var salt = crypt.randomBytes(16).toString('hex');
    var pw = crypt.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return { salt: salt, pw: pw };
}
;
/** VALID PASSWORD - verifica che la pw inserita sia corretta*/
function validPassword(password, hash, salt) {
    var newhash = crypt.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return newhash == hash;
}
;
/** dati di accesso al db */
var Pool = require('pg').Pool;
console.log(config.db);
var pool = new Pool(config.db);
/** SAVE USER - salvataggio dati utente su db*/
function saveUser(email, name, iban, salt, pw) {
    return new Promise(function (resolve, reject) {
        var query = 'INSERT INTO users (email, name, iban, password, salt) VALUES ($1, $2, $3, $4, $5)';
        pool.query(query, [email, name, iban, pw, salt], function (error, results) {
            if (error) {
                reject(error);
                console.log(error);
            }
            else {
                console.log('user save into db');
                resolve(results);
            }
        });
    });
}
/** GET PASSWORD AND SALT OF USER - restituisce hash e salt dell'utente dal db*/
function getPasswordAndSaltOfUser(email) {
    return new Promise(function (resolve, reject) {
        var query = 'SELECT password, salt FROM users WHERE email = $1';
        pool.query(query, [email], function (error, results) {
            if (error) {
                reject(error);
                console.log(error);
            }
            else {
                console.log('get user\'s hash and salt from db');
                resolve(results.rows);
            }
        });
    });
}
/** GET PASSWORD AND SALT OF USER - restituisce valori dei conti dell'utente dal db*/
function getCountsValue(email) {
    return new Promise(function (resolve, reject) {
        var query = 'SELECT eur, usd FROM users WHERE email = $1';
        pool.query(query, [email], function (error, results) {
            if (error) {
                reject(error);
                console.log(error);
            }
            resolve(results.rows);
        });
    });
}
/** UPDATE COUNT - aggiornamento valore del conto */
function updateCount(email, symbol, value) {
    return new Promise(function (resolve, reject) {
        var query;
        if (symbol == "EUR") {
            query = 'UPDATE users SET ' +
                'eur = $1+(SELECT eur FROM users WHERE email = $2 FOR UPDATE) ' +
                'WHERE (email = $2) AND ((SELECT eur FROM users WHERE email = $2) >= $1*(-1.00))';
        }
        else {
            query = 'UPDATE users SET ' +
                'usd = $1+(SELECT usd FROM users WHERE email = $2 FOR UPDATE) ' +
                'WHERE (email = $2) AND ((SELECT usd FROM users WHERE email = $2) >= $1*(-1.00))';
        }
        pool.query(query, [value, email], function (error, results) {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(results);
        });
    });
}
/** UPDATE COUNTS - aggiornamento valore di conti con passaggio tra uno e l'altro*/
function updateCounts(email, to, valueFrom, valueTo) {
    return new Promise(function (resolve, reject) {
        var query;
        if (to == "USD") {
            query = 'UPDATE users SET ' +
                'eur = ((SELECT eur FROM users WHERE email = $2 FOR UPDATE)-$1), ' +
                'usd = ((SELECT usd FROM users WHERE email = $2 FOR UPDATE)+$3) ' +
                'WHERE (email = $2) AND ((SELECT eur FROM users WHERE email = $2) >= ($1 *(-1.00)))';
        }
        else {
            query = 'UPDATE users SET ' +
                'usd = ((SELECT usd FROM users WHERE email = $2 FOR UPDATE)-$1), ' +
                'eur = ((SELECT eur FROM users WHERE email = $2 FOR UPDATE)+$3) ' +
                'WHERE (email = $2) AND ((SELECT usd FROM users WHERE email = $2) >= ($1 *(-1.00)))';
        }
        pool.query(query, [valueFrom, email, valueTo], function (error, results) {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(results);
        });
    });
}
/** SAVE TRANSACTION - salvataggio dati della transazione sul db*/
function saveTransaction(email, from, to, value, rate) {
    return new Promise(function (resolve, reject) {
        var query = 'INSERT INTO transactions (mail, "to", "from", value, date, rate) VALUES ($1, $2, $3, $4, current_timestamp, $5)';
        pool.query(query, [email, to, from, value, rate], function (error, results) {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(results);
        });
    });
}
/** FIND TRANSACTIONS - estrazione transazione dell'utente che rispettano i filtri applicati*/
function findTransactions(email, from, to, valueMin, valueMax, dateMin, dateMax, rateMin, rateMax) {
    return new Promise(function (resolve, reject) {
        var query = 'SELECT * FROM transactions WHERE mail=$1';
        var values = [email];
        var i = 2;
        if (from) {
            query += ' AND transactions.from=$' + i;
            values.push(from);
            i++;
        }
        if (to) {
            query += ' AND transactions.to=$' + i;
            values.push(to);
            i++;
        }
        if (valueMin) {
            query += ' AND transactions.value>=$' + i;
            values.push(valueMin);
            i++;
        }
        if (valueMax) {
            query += ' AND transactions.value<=$' + i;
            values.push(valueMax);
            i++;
        }
        if (dateMin) {
            query += ' AND transactions.date>=$' + i;
            values.push(dateMin);
            i++;
        }
        if (dateMax) {
            query += ' AND transactions.date<=$' + i;
            values.push(dateMax);
            i++;
        }
        if (rateMin) {
            query += ' AND transactions.rate>=$' + i;
            values.push(rateMin);
            i++;
        }
        if (rateMax) {
            query += ' AND transactions.rate<=$' + i;
            values.push(rateMax);
            i++;
        }
        pool.query(query, values, function (error, results) {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(results.rows);
        });
    });
}
/** CREATE TOKEN - crea il il token JWT partendo dalla mail dell'utente*/
function createToken(mail) {
    var token = jwt.sign({ mail: mail }, jwtKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds
    });
    return { token: token, maxAge: jwtExpirySeconds * 1000 };
}
var implementations = {
    /** SIGNUP -  salva l'utente sul db e restituisce il token JWT*/
    signup: function (call, callback) {
        if (!call.request.email || !call.request.password || !call.request.name || !call.request.iban) {
            console.log("signup - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        var _a = hashingPassword(call.request.password), salt = _a.salt, pw = _a.pw;
        saveUser(call.request.email, call.request.name, call.request.iban, salt, pw)
            .then(function (response) {
            var _a = createToken(call.request.email), token = _a.token, maxAge = _a.maxAge;
            return callback(null, {
                token: token,
                maxAge: maxAge
            });
        })["catch"](function (error) {
            if (error.code == 23505) {
                console.log("signup - duplicate email");
                return callback({
                    code: 409,
                    message: "duplicate record: user with this email already exists",
                    status: grpc.status.INTERNAL
                });
            }
            else {
                console.log("signup - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with insert into db",
                    status: grpc.status.INTERNAL
                });
            }
        });
    },
    /** LOGIN -  controlla dati utente e restituisce il token JWT*/
    login: function (call, callback) {
        if (!call.request.email || !call.request.password) {
            console.log("login - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        getPasswordAndSaltOfUser(call.request.email)
            .then(function (response) {
            if (!response[0]) {
                console.log("login - wrong user");
                return callback({
                    code: 401,
                    message: "wrong user",
                    status: grpc.status.INTERNAL
                });
            }
            var pw = response[0].password;
            var salt = response[0].salt;
            if (validPassword(call.request.password, pw, salt)) {
                console.log("user authenticated");
                var _a = createToken(call.request.email), token = _a.token, maxAge = _a.maxAge;
                return callback(null, {
                    token: token,
                    maxAge: maxAge
                });
            }
            console.log("login - wrong password");
            return callback({
                code: 401,
                message: "wrong password",
                status: grpc.status.INTERNAL
            });
        })["catch"](function (error) {
            console.log("login - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });
    },
    /** REFRESH TOKEN -  rigenera il token JWT, controllando se è un token corretto e che sia in scadenza*/
    refreshToken: function (call, callback) {
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
        var payload;
        try {
            payload = jwt.verify(call.request.token, jwtKey);
        }
        catch (e) {
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
        var nowUnixSeconds = Math.round(Number(new Date()) / 1000);
        if (payload.exp - nowUnixSeconds > 30) {
            console.log("refreshToken - too early");
            return callback({
                code: 400,
                message: "have to wait more before ask to refresh token",
                status: grpc.status.INTERNAL
            });
        }
        var _a = createToken(call.request.email), token = _a.token, maxAge = _a.maxAge;
        console.log("token refreshed");
        return callback(null, {
            token: token,
            maxAge: maxAge
        });
    },
    /** GET COUNTS - restituisce i valori dei conti dell'utente*/
    getCounts: function (call, callback) {
        if (!call.request.email) {
            console.log("getCounts - empty email");
            return callback({
                code: 400,
                message: "empty email",
                status: grpc.status.INTERNAL
            });
        }
        if (!call.request.token) {
            console.log("getCounts - empty token");
            return callback({
                code: 401,
                message: "empty token",
                status: grpc.status.INTERNAL
            });
        }
        var payload;
        try {
            payload = jwt.verify(call.request.token, jwtKey);
        }
        catch (e) {
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
        getCountsValue(call.request.email)
            .then(function (response) {
            console.log('getCounts - get counts value from db');
            return callback(null, {
                eur: response[0].eur,
                usd: response[0].usd
            });
        })["catch"](function (error) {
            console.log("getCounts - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });
    },
    /** DEPOSIT - deposito sul conto dell'utente di una somma nella valuta scelta*/
    deposit: function (call, callback) {
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token) {
            console.log("deposit - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        try {
            jwt.verify(call.request.token, jwtKey);
        }
        catch (e) {
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
        if (call.request.symbol != "EUR" && call.request.symbol != "USD") {
            console.log("deposit - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.value <= 0) {
            console.log("deposit - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }
        updateCount(call.request.email, call.request.symbol, call.request.value)
            .then(function (response) {
            console.log('deposit - update count into db');
            saveTransaction(call.request.email, 'IBAN', call.request.symbol, call.request.value, 0)
                .then(function (response) {
                console.log('deposit - save deposit transaction into db');
                return callback();
            })["catch"](function (error) {
                console.log("deposit - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with db",
                    status: grpc.status.INTERNAL
                });
            });
        })["catch"](function (error) {
            console.log("deposit - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });
    },
    /** WITHDRAW - prelievo dal conto dell'utente di una somma nella valuta scelta*/
    withdraw: function (call, callback) {
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token) {
            console.log("withdraw - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        try {
            jwt.verify(call.request.token, jwtKey);
        }
        catch (e) {
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
        if (call.request.symbol != "EUR" && call.request.symbol != "USD") {
            console.log("withdraw - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.value <= 0) {
            console.log("withdraw - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }
        updateCount(call.request.email, call.request.symbol, (call.request.value * -1))
            .then(function (response) {
            console.log('withdraw - update count into db');
            saveTransaction(call.request.email, call.request.symbol, 'IBAN', call.request.value, 0)
                .then(function (response) {
                console.log('save withdraw transaction into db');
                return callback();
            })["catch"](function (error) {
                console.log("withdraw - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with db",
                    status: grpc.status.INTERNAL
                });
            });
        })["catch"](function (error) {
            if (error.code == 22012) {
                console.log("withdraw - not enought");
                return callback({
                    code: 400,
                    message: "user not have enought for withdraw",
                    status: grpc.status.INTERNAL
                });
            }
            else {
                console.log("withdraw - internal error with db");
                return callback({
                    code: 500,
                    message: "internal error with db",
                    status: grpc.status.INTERNAL
                });
            }
        });
    },
    /** BUY - sposta una determinata quantità da un conto all'altro applicando il tasso di cambio*/
    buy: function (call, callback) {
        if (!call.request.email || !call.request.symbol || !call.request.value || !call.request.token) {
            console.log("buy - invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.symbol != "EUR" && call.request.symbol != "USD") {
            console.log("buy - invalid input");
            return callback({
                code: 400,
                message: "symbol not correct",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.value <= 0) {
            console.log("buy - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }
        try {
            jwt.verify(call.request.token, jwtKey);
        }
        catch (e) {
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
        var to = call.request.symbol;
        var from = 'EUR';
        if (to == 'EUR') {
            from = 'USD';
        }
        var descriptorExchange = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/exchange.proto")));
        var grpcClient = new descriptorExchange.greeter.Greeter(config.exchangeIP + ":9000", grpc.credentials.createInsecure());
        grpcClient.exchange({ value: call.request.value, from: to, to: from }, function (err, data) {
            if (err) {
                console.log("exchange error:" + err);
                data = 0;
                return callback({
                    code: 500,
                    message: "internal error with exchange",
                    status: grpc.status.INTERNAL
                });
            }
            var valuesFrom = data.value;
            updateCounts(call.request.email, call.request.symbol, valuesFrom, call.request.value)
                .then(function (response) {
                console.log('buy - update counts into db');
                saveTransaction(call.request.email, from, call.request.symbol, call.request.value, data.rate)
                    .then(function (response) {
                    console.log('save buy transaction into db');
                    return callback();
                })["catch"](function (error) {
                    console.log("buy - internal error with db");
                    return callback({
                        code: 500,
                        message: "internal error with db",
                        status: grpc.status.INTERNAL
                    });
                });
            })["catch"](function (error) {
                if (error.code == 22012) {
                    console.log("buy - not enought");
                    return callback({
                        code: 400,
                        message: "user not have enought for buy",
                        status: grpc.status.INTERNAL
                    });
                }
                else {
                    console.log("buy - internal error with db");
                    return callback({
                        code: 500,
                        message: "internal error with db",
                        status: grpc.status.INTERNAL
                    });
                }
            });
        });
    },
    /** LIST TRANSACTIONS - restituisce la lista di transazioni di un utente con la possiblità di filtrarle */
    listTransactions: function (call, callback) {
        if (!call.request.email || !call.request.token) {
            console.log("listTransactions - empty required input");
            return callback({
                code: 400,
                message: "one or more empty required input",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.valueMin && call.request.valueMax && call.request.valueMax < call.request.valueMin) {
            console.log("listTransactions - valueMax<valueMin");
            return callback({
                code: 400,
                message: "valueMax<valueMin",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.dateMin && call.request.dateMax && call.request.dateMax < call.request.dateMin) {
            console.log("listTransactions - dateMax<dateMin");
            return callback({
                code: 400,
                message: "dateMax<dateMin",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.rateMin && call.request.rateMax && call.request.rateMin < call.request.rateMax) {
            console.log("listTransactions - rateMin<rateMax");
            return callback({
                code: 400,
                message: "rateMin<rateMax",
                status: grpc.status.INTERNAL
            });
        }
        if ((call.request.from && call.request.from != "EUR" && call.request.from != "USD" && call.request.from != "IBAN") || (call.request.to && call.request.to != "EUR" && call.request.to != "USD" && call.request.to != "IBAN")) {
            console.log("listTransactions - invalid to/from symbol");
            return callback({
                code: 400,
                message: "symbol to/from not correct",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.value <= 0) {
            console.log("buy - invalid value");
            return callback({
                code: 400,
                message: "value not correct",
                status: grpc.status.INTERNAL
            });
        }
        try {
            jwt.verify(call.request.token, jwtKey);
        }
        catch (e) {
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
        findTransactions(call.request.email, call.request.from, call.request.to, call.request.valueMin, call.request.valueMax, call.request.dateMin, call.request.dateMax, call.request.rateMin, call.request.rateMax)
            .then(function (response) {
            console.log('listTransactions - get list from db');
            return callback(null, {
                response: JSON.stringify(response)
            });
        })["catch"](function (error) {
            console.log("listTransactions - internal error with db");
            return callback({
                code: 500,
                message: "internal error with db",
                status: grpc.status.INTERNAL
            });
        });
    }
};
/** avvio users grpc server */
var descriptorUsers = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto")));
var server = new grpc.Server();
server.bindAsync = promisify(server.bindAsync);
server.bindAsync('0.0.0.0:' + PORT, grpc.ServerCredentials.createInsecure())
    .then(function () {
    server.addService(descriptorUsers.greeter.Greeter.service, implementations);
    server.start();
    console.log("users grpc server started on port %O", PORT);
})["catch"](console.log);
