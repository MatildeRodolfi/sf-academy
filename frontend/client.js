/*TODO capire perchè quando conpila exchangeApi compila sbagliato*/
require("isomorphic-fetch")

const client = require("../api/exchangeApi.js")({
  endpoint: "http://localhost:80",
  securityHandlers: {
    petstore_auth: () => {
      console.log("test auth")
      return "jwt"
    },
    api_key: () => "this is an api key"
  }
})

/*client.signup({
  body: {
    email: "bho3@nonso.it", 
    password: "password", 
    name: "MarioRossi", 
    iban: "IT0000"
  }
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error)

  client.buy({
    body: {
      email: "bho3@nonso.it", 
      password: "password"
    }
  })
    .then(res => res.json())
    .then(console.log)
    .catch(console.error)

    client.deposit({
        body: {
          email: "bho3@nonso.it", 
          value: 11.45,
          symbol: "EUR", 
          token: "fg"
        }
      })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error)*/

    client.listTransactions({
        body: {
            email: "bho3@nonso.it", 
            valueMin: 11.45,
            token: "fg"
        }
        })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error)
