const chai = require('chai')
chai.use(require('chai-interface'))

const proxy = require('./proxy')
const checkAutopilot = require('./checkAutopilot')
const checkBestLocation = require('./checkBestLocation')
// const expireUser = require('../admin/expireTestUser')
// const unExpireUser = require('../admin/unExpireTestUser')
// const upgradeUser = require('../admin/upgradeTestUser')
// const downgradeUser = require('../admin/downgradeTestUser')

const connectToDefault = proxy.find(i => i.name === 'ConnectToDefault')

module.exports = [
  // upgradeUser,
  checkAutopilot,
  checkBestLocation,
  connectToDefault,
  // downgradeUser,
  checkAutopilot,
  checkBestLocation,
  // expireUser,
  // unExpireUser,
]
