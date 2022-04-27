const { flatten } = require('lodash')
// const createUser = require('../admin/createTestUser')
const login = require('./login')
const onBoarding = require('./onBoarding')
const connect = require('./connect')
const general = require('./general')
const connection = require('./connection')

const domains = {
  // createUser,
  login,
  onBoarding,
  connect,
  general,
  connection,
}

module.exports = (whitelist = []) =>
  whitelist.length
    ? flatten(
        Object.entries(domains)
          .filter(([key]) => whitelist.includes(key))
          .map(([, v]) => v),
      )
    : flatten(Object.values(domains))
