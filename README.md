## How to run

### DEV

* Start Postgres Databse using docker-compose

```bash
docker-compose up -d
```

* Copy the example environment file

```bash
cp .env.example .env
```
* Install dependencies

```bash
npm i
```

* Run migrations

```bash
node migrate up
```

* Start the API

```
npm run server:dev
```

#### With docker

```bash
docker build . -t scheduling
docker run scheduling --env-file=.env
```

## Tests

Tests are located uneder src/__tests__/ and are classified as: unit, integration or e2e

To run the tests run `npm run tests:unit`, `npm run tests:integration`, `npm run tests:e2e`

Note: to run integration or e2e tests the databse needs to be running
