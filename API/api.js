var protoLoader = require("@grpc/proto-loader");
var grpc = require("@grpc/grpc-js");
var join = require("path").join;
var descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/users.proto")));
var express = require("express");
var bodyParser = require("body-parser");
var initialize = require("express-openapi").initialize;
var cors = require('cors');
var config = require('../config');
var grpcClient = new descriptor.greeter.Greeter(config.usersIP + ":9001", grpc.credentials.createInsecure());
var operations = {
    signup: function (req, res, next) {
        grpcClient.signup({ email: req.body.email, password: req.body.password, name: req.body.name, iban: req.body.iban }, function (err, data) {
            if (err) {
                console.log("signup error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("signup ok");
                return res.status(200).json({
                    token: data.token,
                    maxAge: data.maxAge
                });
            }
        });
    },
    login: function (req, res, next) {
        grpcClient.login({ email: req.body.email, password: req.body.password }, function (err, data) {
            if (err) {
                console.log("login error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("login ok");
                return res.status(200).json({
                    token: data.token,
                    maxAge: data.maxAge
                });
            }
        });
    },
    refreshToken: function (req, res, next) {
        grpcClient.refreshToken({ email: req.body.email, token: req.body.token }, function (err, data) {
            if (err) {
                console.log("refreshToken error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("refreshToken ok");
                return res.status(200).json({
                    token: data.token,
                    maxAge: data.maxAge
                });
            }
        });
    },
    getCounts: function (req, res, next) {
        grpcClient.getCounts({ email: req.body.email, token: req.body.token }, function (err, data) {
            if (err) {
                console.log("counts error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("getCounts ok");
                return res.status(200).json({
                    eur: data.eur,
                    usd: data.usd
                });
            }
        });
    },
    deposit: function (req, res, next) {
        console.log("deposit acquired");
        grpcClient.deposit({ email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token }, function (err, data) {
            if (err) {
                console.log("deposit error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("deposit ok");
                return res.status(200).json({
                    data: data
                });
            }
        });
    },
    withdraw: function (req, res, next) {
        grpcClient.withdraw({ email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token }, function (err, data) {
            if (err) {
                console.log("withdraw error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("withdraw ok");
                return res.status(200).json({
                    data: data
                });
            }
        });
    },
    buy: function (req, res, next) {
        grpcClient.buy({ email: req.body.email, value: req.body.value, symbol: req.body.symbol, token: req.body.token }, function (err, data) {
            if (err) {
                console.log("buy error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("buy ok");
                return res.status(200).json({
                    data: data
                });
            }
        });
    },
    listTransactions: function (req, res, next) {
        grpcClient.listTransactions({ email: req.body.email, from: req.body.from, to: req.body.to, valueMin: req.body.valueMin, valueMax: req.body.valueMax, dateMin: req.body.dateMin, dateMax: req.body.dateMax, rateMin: req.body.rateMin, rateMax: req.body.rateMax, token: req.body.token }, function (err, data) {
            if (err) {
                console.log("listTransactions error: " + err.details);
                var details = err.details;
                return res.status(400).json({
                    details: details
                });
            }
            else {
                console.log("listTransactions ok");
                var data = data.response;
                return res.status(200).json({
                    transactions: data
                });
            }
        });
    }
};
var app = express();
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());
initialize({
    app: app,
    errorMiddleware: function (err, req, res, next) {
        res.json(err);
    },
    apiDoc: join(__dirname, "apiDoc.yml"),
    dependencies: {
        log: console.log
    },
    operations: operations
});
app.listen(80, function () { return console.log("api listening on port 80"); });
