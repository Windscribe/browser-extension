require('@babel/register')({
  presets: ['@babel/env'],
})

const server = require('./local-server')

const port = process.env.TEST_SERVER_PORT || 1337
// eslint-disable-next-line no-console
server.listen(port, () => console.log(`test server listening on ${port}`))
