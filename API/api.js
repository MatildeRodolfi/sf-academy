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
})*/

/*grpcClient.refreshToken({email: "bho@nonso.it", token: ""}, (err, data) => {
    console.log({ err, data })
})

grpcClient.deposit({email: "bho@nonso.it", value : 100, symbol : "USD", token: "eyJh"}, (err, data) => {
  console.log({ err, data })
})

grpcClient.withdraw({email: "bho@nonso.it", value : 100, symbol : "USD", token: "eyJh"}, (err, data) => {
  console.log({ err, data })
})*/

grpcClient.buy({email: "bho@nonso.it", value : 10, symbol : "USD", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYWlsIjoiYmhvQG5vbnNvLml0IiwiaWF0IjoxNjc2NjQ5NDc4LCJleHAiOjE2NzY2NDk3Nzh9.Jc4IF-PjqIBPa14dVfC2_4CxfXDTsRFq8PaREVeEJnA"}, (err, data) => {
  console.log({ err, data })
})