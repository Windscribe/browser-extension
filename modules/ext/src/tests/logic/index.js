const { flatten } = require('lodash')

const auth = require('./auth')
const proxy = require('./proxy')
const ublock = require('./ublock')
const userAgent = require('./userAgent')
const debugLog = require('./debugLog')
const email = require('./email')
const whitelist = require('./whitelist')
const statusChanges = require('./statusChanges')
// const sessionPoller = require('./session-poller'
// const createUser = require('../admin/createTestUser')
// const adminLogin = require('../admin/loginWithAdminUser.js')

const logout = require('./logout')
// TODO: split these up into sub domains later for different flows
const domains = {
  // createUser,
  // adminLogin,
  auth,
  proxy,
  statusChanges,
  ublock,
  whitelist,
  userAgent,
  debugLog,
  email,
  //sessionPoller,
  logout,
}

module.exports = (whitelist = []) =>
  whitelist.length
    ? flatten(
        Object.entries(domains)
          .filter(([key]) => whitelist.includes(key))
          .map(([, v]) => v),
      )
    : flatten(Object.values(domains))
