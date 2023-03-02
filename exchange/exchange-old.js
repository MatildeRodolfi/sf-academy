const protoLoader = require("@grpc/proto-loader")
const grpc = require("@grpc/grpc-js")
const { join } = require("path")
const { promisify } = require("util")
const PORT = 9000

var https = require('https');
const convert = require('xml-js');

const implementations = {
    exchange: (call, callback) => {
        if (!call.request.value || !call.request.from || !call.request.to){
            console.log("invalid input");
            return callback({
                code: 400,
                message: "one or more empty input",
                status: grpc.status.INTERNAL
            });
        }
        if (call.request.value<=0){
            console.log("invalid value");
            return callback({
                code: 400,
                message: "invalid value",
                status: grpc.status.INTERNAL
            });
        }
        if ((call.request.from!='USD' && call.request.from!='EUR') || (call.request.to!='USD' && call.request.to!='EUR')){
            console.log("invalid currency");
            return callback({
                code: 400,
                message: "invalid currency",
                status: grpc.status.INTERNAL
            });
        }

        var data = '';
        var ris = -1;
        https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml?46f0dd7988932599cb1bcac79a10a16a}', function(res) {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                res.on('data', function(data_) { data += data_.toString(); });
                res.on('end', function() {
                    const jsonData = JSON.parse(convert.xml2json(data, {compact: true, spaces: 2}));
                    const cubeArray = jsonData['gesmes:Envelope']['Cube']['Cube']['Cube'];
                    var rate = -1;
                    cubeArray.forEach((element) => {
                        var currency = element['_attributes'].currency;
                        if (currency=='USD'){
                            rate = element['_attributes'].rate;
                        }
                    });

                    if (rate>0){
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

const descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/exchange.proto")))
const server = new grpc.Server()
server.bindAsync = promisify(server.bindAsync)
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure())
  .then(() => {
    server.addService(descriptor.greeter.Greeter.service, implementations)
    server.start()
    console.log("exchange grpc server started on port %O", PORT)
  })
  .catch(console.log)
