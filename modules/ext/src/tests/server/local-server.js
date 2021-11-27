const express = require('express')
const path = require('path')
const userAgent = require('express-useragent')

const expressServer = express()

const LOCAL_SERVER_RESPONSE = process.env.LOCAL_SERVER_RESPONSE || 'hey hey hey'

expressServer.use(userAgent.express())

expressServer.get('/', (req, res) => {
  res.send(LOCAL_SERVER_RESPONSE)
})

expressServer.get('/userAgent/rest', (req, res) => {
  res.send(req.useragent.source)
})

expressServer.use(
  '/adtest',
  express.static(path.join(__dirname, 'static', 'adtest')),
)

expressServer.use(
  '/userAgent',
  express.static(path.join(__dirname, 'static', 'userAgent')),
)

expressServer.use(
  '/geolocation',
  express.static(path.join(__dirname, 'static', 'geolocation')),
)

expressServer.use(
  '/proxyTime',
  express.static(path.join(__dirname, 'static', 'proxyTime')),
)

module.exports = expressServer
