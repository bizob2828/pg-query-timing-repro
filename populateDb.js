'use strict'

const { Pool } = require('pg')
const config = require('./dbconfig')
const randomWords = require('random-words')

for (let i = 0; i < 50; i++) {
  const name = randomWords({exactly:1, wordsPerString:1})[0]
  console.log(name)
  const pool = new Pool(config)
  pool.query(`INSERT INTO kitties (name) values ('${name}')`)
  pool.end()
}

for (let i = 0; i < 50; i++) {
  const name = randomWords({exactly:1, wordsPerString:1})[0]
  console.log(name)
  const pool = new Pool(config)
  pool.query(`INSERT INTO puppies (name) values ('${name}')`)
  pool.end()
}
