const protoLoader = require("@grpc/proto-loader")
const grpc = require("@grpc/grpc-js")
import { join } from "path";
import { promisify } from "util";
import convert from 'xml-js';
import { config } from './config/config'

import { ExchangeServiceHandlers } from './proto/build/exchangePackege/ExchangeService';
import { ProtoGrpcType } from './proto/build/exchange';

const https = require('https');

const implementations:ExchangeServiceHandlers = {
    exchange: (call:any, callback:Function) => {
        if (!call.request.value || !call.request.from || !call.request.to){
            console.log("invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INVALID_ARGUMENT
            });
        }
        if (call.request.value<=0){
            console.log("invalid value");
            return callback({
                code: 400,
                message: "invalid value",
                status: grpc.status.INVALID_ARGUMENT
            });
        }
        if ((call.request.from!='USD' && call.request.from!='EUR') || (call.request.to!='USD' && call.request.to!='EUR')){
            console.log("invalid currency");
            return callback({
                code: 400,
                message: "invalid currency",
                status: grpc.status.INVALID_ARGUMENT
            });
        }

        https.get(config.ECBlink, function(res:any) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                var data:string = '';

                res.on('data', function(data_:any) { data += data_.toString(); });
                res.on('end', function() {
                    const jsonData = JSON.parse(convert.xml2json(data, {compact: true, spaces: 2}));
                    const cubeArray = jsonData['gesmes:Envelope']['Cube']['Cube']['Cube'];
                    var rate:number = -1;
                    cubeArray.forEach((element:any) => {
                        var currency:string = element['_attributes'].currency;
                        if (currency=='USD'){
                            rate = element['_attributes'].rate;
                        }
                    });

                    if (rate>0){
                        var ris:number = -1;

                        if (call.request.from=='EUR'){
                            ris = call.request.value * rate;
                        }
                        else{
                            ris = call.request.value/rate;
                        }

                        console.log('from '+call.request.from+' to '+call.request.to+' with exchange rate of '+rate+' \n result: '+ris+'\n');
                        return callback(null, {
                            value: ris,
                            rate: rate
                        })
                    }
                    else{
                        return callback({
                            code: 500,
                            message: "internal error - find rate",
                            status: grpc.status.INTERNAL
                        });
                    }
                        
                });
            }
            else{
                return callback({
                    code: 500,
                    message: "internal error - contact ecb",
                    status: grpc.status.INTERNAL
                });
            }
        });
    }
}


const descriptor = (grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/exchange.proto"))) as unknown) as ProtoGrpcType;
const server = new grpc.Server()
server.bindAsync = promisify(server.bindAsync)
server.bindAsync('0.0.0.0:'+config.exchangePort, grpc.ServerCredentials.createInsecure(), (error:Error, port:number)=>{
    server.addService(descriptor.exchangePackege.ExchangeService.service, implementations)
    server.start()
    console.log("exchange grpc server started on port "+config.exchangePort)
})
  
