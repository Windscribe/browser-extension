/* global fetch */
global.fetch = require('node-fetch')

if (!fetch) {
  throw Error('Cannot setup fetch')
}
