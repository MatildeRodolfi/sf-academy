const { outputFileSync, copyFileSync } = require("fs-extra")
const { join } = require("path")
const fetchOpenApi = require("fetch-openapi")

const YAML = require("yamljs")
const apiDoc = YAML.load(join(__dirname, "../api/apiDoc.yml"))

const generator = fetchOpenApi(apiDoc, {
  preset: "node"
})

outputFileSync(join(__dirname, "../api/exchangeApi.js"), generator, "utf8")