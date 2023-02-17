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

grpcClient.refreshToken({email: "bho@nonso.it", token: ""}, (err, data) => {
    console.log({ err, data })
})*/