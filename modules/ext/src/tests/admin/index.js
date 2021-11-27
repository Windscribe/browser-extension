const { create } = require('ws-api-client/cjs')
const { create: createAdmin } = require('ws-api-client/cjs/admin')
const { sampleSize } = require('lodash')

const api = create({
  apiUrl: process.env.TEST_API_URL,
  assetsUrl: process.env.TEST_ASSET_URL,
})

function generatePassword(length) {
  const chars = 'abcdefghkmnpqrstuvwxyzABCDEFGHKMNPQRSTUVWXYZ23456789'
  return sampleSize(chars, length).join('')
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// creates a dummy user for logic and e2e tests (if needed)
if (!global.TEST_USER) {
  const generateRandomPassword = () => generatePassword(33)
  const generateUser = () =>
    (process.env.TEST_USERNAME_PREFIX || '__ws-test-user--') + uuidv4()

  global.TEST_USER = {
    username: generateUser(),
    password: generateRandomPassword(),
  }
}

const adminApi = createAdmin({
  apiUrl: process.env.TEST_ADMIN_API_URL,
})

const ACCOUNT_STATES = {
  ACTIVE: 1,
  EXPIRED: 2,
  BANNED: 3,
}

const BILLING_PLANS = {
  FIFTY_MEG: -7,
  TEN_GIG: -1,
  ONE_MONTH_PRO: 1,
}

module.exports = { api, adminApi, ACCOUNT_STATES, BILLING_PLANS }
