const argv = require('yargs').argv

require('babel-polyfill')
require('@babel/register')({
  presets: ['@babel/env'],
})

require(`./${argv.script}`)
