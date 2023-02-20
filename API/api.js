const protoLoader = require("@grpc/proto-loader")
const grpc = require("@grpc/grpc-js")
const { join } = require("path")
const descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto")))
const grpcClient = new descriptor.greeter.Greeter("0.0.0.0:9001", grpc.credentials.createInsecure())

/*grpcClient.signup({email: "bho@nonso.it", password: "password", name: "MarioRossi", iban: "IT0000"}, (err, data) => {
  console.log({ err, data })
})

grpcClient.login({email: "bho@nonso.it", password: "password"}, (err, data) => {
    console.log({ err, data })
})

rpcClient.refreshToken({email: "bho@nonso.it", token: ""}, (err, data) => {
    console.log({ err, data })
})

grpcClient.deposit({email: "bho@nonso.it", value : 100, symbol : "EUR", token: "eyJh"}, (err, data) => {
  console.log({ err, data })
})

grpcClient.withdraw({email: "bho@nonso.it", value : 5, symbol : "EUR", token: "eyJh"}, (err, data) => {
  console.log({ err, data })
})

grpcClient.buy({email: "bho@nonso.it", value : 80, symbol : "USD", token: "eyJh"}, (err, data) => {
  console.log({ err, data })
})

grpcClient.listTransactions({email: "bho@nonso.it", to: "EUR", valueMax: 6, token: "eyJh"}, (err, data) => {
  //var ris = JSON.parse(data.response);
  var ris = data;
  console.log({err, ris});
})*/