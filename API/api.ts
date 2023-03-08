const grpc = require("@grpc/grpc-js")
import { join } from "path"
import express from "express"
import bodyParser from "body-parser"
import { initialize } from "express-openapi"
import cors from 'cors'
const protoLoader = require("@grpc/proto-loader");
import { config } from './config/config'


const descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto")));
const grpcClient = new descriptor.usersPackage.usersService(config.usersHost+":"+config.usersPort, grpc.credentials.createInsecure());

const operations = {
  signup: (req:any, res:any, next:any) => {
    console.log("signup acquired")
    grpcClient.signup({email: req.body.email, password: req.body.password, name: req.body.name, iban: req.body.iban}, (err:any, data:any) => {
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
          token: data.token,
          maxAge: data.maxAge
        })
      }
    })
  },

  login: (req:any, res:any, next:any) => {
    console.log("login acquired")
    grpcClient.login({email: req.body.email, password: req.body.password}, (err:any, data:any) => {
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
          token: data.token,
          maxAge: data.maxAge
        })
      }
    })
  },

  refreshToken: (req:any, res:any, next:any) => {
    console.log("refreshToken acquired")
    grpcClient.refreshToken({email: req.body.email, token: req.body.token}, (err:any, data:any) => {
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
          token: data.token,
          maxAge: data.maxAge
        })
      }
    })
  },

  getCounts: (req:any, res:any, next:any) => {
    console.log("getCounts acquired")
    grpcClient.getCounts({email: req.body.email, token: req.body.token}, (err:any, data:any) => {
      if (err){
        console.log("counts error: "+err.details)
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

  deposit: (req:any, res:any, next:any) => {
    console.log("deposit acquired")
    grpcClient.deposit({email: req.body.email, value : req.body.value, symbol : req.body.symbol, token : req.body.token}, (err:any, data:any) => {
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

  withdraw: (req:any, res:any, next:any) => {
    console.log("withdraw acquired")
    grpcClient.withdraw({email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token}, (err:any, data:any) => {
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

  buy: (req:any, res:any, next:any) => {
    console.log("buy acquired")
    grpcClient.buy({email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token}, (err:any, data:any) => {
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

  listTransactions: (req:any, res:any, next:any) => {
    console.log("listTransactions acquired")
    grpcClient.listTransactions({email: req.body.email, from: req.body.from, to: req.body.to, valueMin: req.body.valueMin, valueMax: req.body.valueMax, dateMin: req.body.dateMin, dateMax: req.body.dateMax, rateMin: req.body.rateMin, rateMax: req.body.rateMax, token: req.body.token}, (err:any, data:any) => {
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
          transactions: data
        })
      }
    })
  },

}

const app = express()

app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json())

initialize({
  app,
  errorMiddleware: (err:any, req:any, res:any, next:any) => {
    res.json(err)
  },
  apiDoc: join(__dirname, "../apiDoc.yml"),
  dependencies: {
    log: console.log
  },
  operations
})

app.listen(config.apiPort, () => console.log("api listening on port "+config.apiPort))