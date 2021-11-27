const { flatten } = require('lodash')
const createUser = require('../admin/createTestUser')
const login = require('./login')
const onBoarding = require('./onBoarding')
const connect = require('./connect')
const smokewall = require('./smokewall')

const domains = {
  createUser,
  login,
  onBoarding,
  connect,
  smokewall,
}

module.exports = (whitelist = []) =>
  whitelist.length
    ? flatten(
        Object.entries(domains)
          .filter(([key]) => whitelist.includes(key))
          .map(([, v]) => v),
      )
    : flatten(Object.values(domains))
