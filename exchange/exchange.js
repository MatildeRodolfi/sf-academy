const protoLoader = require("@grpc/proto-loader")
const grpc = require("@grpc/grpc-js")
const { join } = require("path")
const { promisify } = require("util")
const { PORT = 9000 } = process.env

var https = require('https');
const convert = require('xml-js');

const implementations = {
    exchange: (call, callback) => {
        var data = '';
        var ris = -1;
        https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml?46f0dd7988932599cb1bcac79a10a16a}', function(res) {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                res.on('data', function(data_) { data += data_.toString(); });
                res.on('end', function() {
                    const jsonData = JSON.parse(convert.xml2json(data, {compact: true, spaces: 2}));
                    const cubeArray = jsonData['gesmes:Envelope']['Cube']['Cube']['Cube'];
                    var rate = 100;
                    cubeArray.forEach((element) => {
                        var currency = element['_attributes'].currency;
                        if (currency=='USD'){
                            rate = element['_attributes'].rate;
                        }
                    });
                    console.log("rate: "+rate);

                    if (!call.request.value && !call.request.from && !call.request.to){
                        responseObserver.onError(Status.FAILED_PRECONDITION.withDescription("Empty fields").asRuntimeException());
                    }
                    if (call.request.value<=0){
                        responseObserver.onError(Status.FAILED_PRECONDITION.withDescription("Value error").asRuntimeException());
                    }
                    if ((call.request.from!='USD' && call.request.from!='EUR') || (call.request.to!='USD' && call.request.to!='EUR')){
                        responseObserver.onError(Status.FAILED_PRECONDITION.withDescription("Currency error").asRuntimeException());
                    }

                    console.log("value: "+call.request.value);
                    if (call.request.from=='EUR'){
                        ris = call.request.value * rate;
                    }
                    else{
                        ris = call.request.value/rate;
                    }
                    console.log("ris: "+ris);

                    callback(null, {
                        value: ris
                    })
                });
            }
        });
    }
}

const descriptor = grpc.loadPackageDefinition(protoLoader.loadSync(join(__dirname, "../proto/greeter.proto")))
const server = new grpc.Server()
server.bindAsync = promisify(server.bindAsync)
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure())
  .then(() => {
    server.addService(descriptor.greeter.Greeter.service, implementations)
    server.start()
    console.log("grpc server started on port %O", PORT)
  })
  .catch(console.log)
