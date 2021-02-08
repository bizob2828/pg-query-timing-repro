"use strict"

const jsonapiRenderer = require("jsonapi-renderer")
const {getRandoRowNo} = require("./utils")

const queryModel = {
  type: "query",
  attributes: {
    now: {
      async get({ client }) {
        const result = await client.query(`select pg_sleep(1), name, now() as now from kitties WHERE id = ${getRandoRowNo(100)}`)
        return new Date(result.rows[0].now).toString()
      },
      renderByDefault: true,
    },
  },
}

module.exports = function (client) {
  return jsonapiRenderer([queryModel]).render(
    [
      { jsonapiType: "query", id: 1 },
      { jsonapiType: "query", id: 2 },
      { jsonapiType: "query", id: 3 },
      // { jsonapiType: "query", id: 4 }
    ],
    { resolution: { client } }
  )
}
