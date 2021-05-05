"use strict"

// const newrelic = require("newrelic")
const { Client } = require("pg")
const Koa = require('koa')
const Router = require('koa-router')
const dbconfig = require('./dbconfig')
const {getRandoRowNo} = require('./utils')

const app = new Koa()
const router = new Router()

const PORT = 1999

const jsonapiRendererExample = require("./jsonapi-renderer-example")

const getPup = async () => {
  const client = new Client(dbconfig)
  try {
    await client.connect()
    console.log("Connection has been established successfully.")
  } catch (err) {
    console.error("Unable to connect to the database:", err)
  }
  const results = await client.query(`SELECT pg_sleep(1) as sleep, now() as now, name from puppies WHERE id = ${getRandoRowNo(100)}`)
  const pup = results.rows[0].name

  await client.end()

  return pup
}


async function main() {
  const client = new Client(dbconfig)
  try {
    await client.connect()
    console.log("Connection has been established successfully.")
  } catch (err) {
    console.error("Unable to connect to the database:", err)
  }

  let result = {}

  const jsonapiResult = await jsonapiRendererExample(client)
  console.log(`jsonapi-renderer returned: ${JSON.stringify(jsonapiResult)}`)

  result.jsonapi = jsonapiResult

  await client.end()

  return result
}

router.get('/', async (ctx, next) => {
  const data = await main()

  ctx.body = data
})
.get('/single', async (ctx, next) => {
  const data = await getPup()

  ctx.body = data
})
.get('/kill', async (ctx) => {
  ctx.body = 'goodbye'
  process.exit(0)
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => {
  console.log(`app listening at port: localhost:${PORT}`)
})
