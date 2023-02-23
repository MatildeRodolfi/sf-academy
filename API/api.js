const protoLoader = require("@grpc/proto-loader")
const grpc = require("@grpc/grpc-js")
const { join } = require("path")
const descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto")))
const grpcClient = new descriptor.greeter.Greeter("0.0.0.0:9001", grpc.credentials.createInsecure())
const express = require("express")
const bodyParser = require("body-parser")
const { initialize } = require("express-openapi")
const cors = require('cors');

const operations = {
  signup: (req, res, next) => {
    grpcClient.signup({email: req.body.email, password: req.body.password, name: req.body.name, iban: req.body.iban}, (err, data) => {
      if (err){
        console.log("signup error: "+err.details)
        var details = err.details;
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("signup ok")
        return res.status(200).json({
          data
        })
      }
    })
  },

  login: (req, res, next) => {
    grpcClient.login({email: req.body.email, password: req.body.password}, (err, data) => {
      if (err){
        console.log("login error: "+err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("login ok")
        return res.status(200).json({
          data
        })
      }
    })
  },

  refreshToken: (req, res, next) => {
    grpcClient.refreshToken({email: req.body.email, token: req.body.token}, (err, data) => {
      if (err){
        console.log("refreshToken error: "+err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("refreshToken ok")
        return res.status(200).json({
          data
        })
      }
    })
  },

  getCounts: (req, res, next) => {
    grpcClient.getCounts({email: req.body.email, token: req.body.token}, (err, data) => {
      if (err){
        console.log(err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("getCounts ok")
        return res.status(200).json({
          eur: data.eur,
          usd: data.usd
        })
      }
    })
  },

  deposit: (req, res, next) => {
    grpcClient.deposit({email: req.body.email, value : req.body.value, symbol : req.body.symbol, token : req.body.token}, (err, data) => {
      if (err){
        console.log("deposit error: "+err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("deposit ok")
        return res.status(200).json({
          data
        })
      }
    })
  },

  withdraw: (req, res, next) => {
    grpcClient.withdraw({email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token}, (err, data) => {
      if (err){
        console.log("withdraw error: "+err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("withdraw ok")
        return res.status(200).json({
          data
        })
      }
    })
  },

  buy: (req, res, next) => {
    grpcClient.buy({email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token}, (err, data) => {
      if (err){
        console.log("buy error: "+err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("buy ok")
        return res.status(200).json({
          data
        })
      }
    })
  },

  listTransactions: (req, res, next) => {
    grpcClient.listTransactions({email: req.body.email, from: req.body.from, to: req.body.to, valueMin: req.body.valueMin, valueMax: req.body.valueMax, dateMin: req.body.dateMin, dateMax: req.body.dateMax, rateMin: req.body.rateMin, rateMax: req.body.rateMax, token: req.body.token}, (err, data) => {
      if (err){
        console.log("listTransactions error: "+err.details)
        var details = err.details
        return res.status(400).json({
          details
        })
      }
      else {
        console.log("listTransactions ok")
        var data = data.response;
        return res.status(200).json({
          data
        })
      }
    })
  }
}

const app = express()

app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json())

initialize({
  app,
  errorMiddleware: (err, req, res, next) => {
    res.json(err)
  },
  apiDoc: join(__dirname, "../api/apiDoc.yml"),
  dependencies: {
    log: console.log
  },
  operations
})

app.listen(80, () => console.log("api listening on port 80"))