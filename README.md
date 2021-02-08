## Instrumented pg query timings repro

This repository demonstrates a reproduction of an issue where Node agent instrumentation of the [`node-postgres`](https://github.com/brianc/node-postgres) module is incorrectly adding database time for internally queued queries.

This issue is being tracked [here](https://igithub.com/newrelic/node-newrelic/issues/345).

### Hypothesis
If multiple queries are run nearly simultaneously with the `node-postgres` (`pg`) package, the Client and Pool code will add the query to the queue within the instrumented `query` function [here](https://github.com/brianc/node-postgres/blob/bf469399b88bcdf86eff096fd0dd05684adc1117/packages/pg/lib/client.js#L478). The queueing happens [here](https://github.com/brianc/node-postgres/blob/bf469399b88bcdf86eff096fd0dd05684adc1117/packages/pg/lib/client.js#L557).

#### Possible Solution
Instrument at the [`Client`](https://github.com/brianc/node-postgres/blob/bf469399b88bcdf86eff096fd0dd05684adc1117/packages/pg/lib/query.js#L15) object, possibly around the `submit` [function](https://github.com/brianc/node-postgres/blob/bf469399b88bcdf86eff096fd0dd05684adc1117/packages/pg/lib/query.js#L151).

## Setup & Reproduction
* run `npm install`

### Data Setup
*Note* this setup is optional, might be able to repro by modifying test queries to just calculate a field or something.

* Setup a couple of tables in a local postgres instance:

```
CREATE TABLE puppies (
    id SERIAL PRIMARY KEY,
    name TEXT,
    createdAt TIMESTAMP,
		updatedAt TIMESTAMP
)

CREATE TABLE kitties (
    id SERIAL PRIMARY KEY,
    name TEXT,
    createdAt TIMESTAMP,
		updatedAt TIMESTAMP
)
```

* Populate with data by just inserting a new string into name the name field. Use the `populateDb.js` file to add data. Just run `node populateDb.js`.

* Add a `.env` file to the root of the project populating the following environment variables:
  * NEW_RELIC_LICENSE_KEY
  * NEW_RELIC_HOST (only needed for staging)
  * PG_DATABASE
  * PG_HOST
  * PG_USER
  * PG_PASSWORD
  * PG_PORT

### Running the reproduction

Run `npm run start` to start the server at `http://localhost:1999`

Send traffic to the route `http://localhost:1999/single` to see query timings for an individual non-queued query.

Send traffic to the base route `http://localhost:1999/` to see query timings for queued queries.

I recommend using a module like `autocannon` to send a burst of traffic to get good averages.

You will see a noticeable jump in query times for the queued queries.

The repro uses the module `jsonapi-renderer` to force queued queries as suggested by @andreas who provided this [repro](https://github.com/andreas/newrelic-pg-issue) that I based this work on. Thank you @andreas