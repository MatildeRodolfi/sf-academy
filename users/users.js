const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")//TODO trovare buil-in Node module for this
const { join } = require("path")
const { promisify } = require("util")
const PORT = 9001
const jwtKey = "dF3OzQ49J0"
const jwtExpirySeconds = 300



function hashingPassword(password) { 
    
    salt = crypto.randomBytes(16).toString('hex'); 
    pw = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 

    return {salt, pw}
}; 

function validPassword (password) { 
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 



const Pool = require('pg').Pool
const pool = new Pool({
  user: 'my_user',
  host: 'localhost',
  database: 'exchange',
  password: 'root',
  port: 5432,
});

function saveUserDb(email, name, iban, salt, pw){
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



function createToken(mail){
    const token = jwt.sign({mail}, jwtKey, {
		algorithm: "HS256",
		expiresIn: jwtExpirySeconds,
	})

    return {token: token, maxAge: jwtExpirySeconds * 1000}
}



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
    signup: (call, callback) => {

        if (!call.request.email || !call.request.password || !call.request.name || !call.request.iban){
            console.log("invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }

        var {salt, pw} = hashingPassword(call.request.password);
        
        saveUserDb(call.request.email, call.request.name, call.request.iban, salt, pw)
        .then(response => {
            var {token, maxAge}= createToken(call.request.email);

            return callback(null, {
                token: token,
                maxAge: maxAge
            })
        })
        .catch(error => {
            if (error.code==23505){
                return callback({
                    code: 409,
                    message: "duplicate record: user with this email already exists",
                    status: grpc.status.INTERNAL
                });
            }
            else{
                return callback({
                    code: 500,
                    message: "internal error with insert into db",
                    status: grpc.status.INTERNAL
                });
            }
            
        })   
    }
}

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
