/* global fetch */
import browserEnv from 'browser-env'
import test from 'ava'
import { create } from './es/index'
import _ from 'lodash'
import login from './test/helpers/login'

browserEnv(['window', 'document'])
let api
let loginHelper
test.beforeEach(t => {
  api = create({ platform: 'test' })
  loginHelper = () => login(api)
})

test('fetch is intialized', t => {
  if (fetch) {
    t.pass('Fetch is setup')
  }
})

test('Api is up', async t => {
  const response = await api.sendRequest({ endpoint: '/ping' })
  const message = await response.text()

  t.is(message, 'Pong')
})

test('Endpoint with no initial slash', async t => {
  const response = await api.sendRequest({ endpoint: 'ping' })
  const message = await response.text()

  t.is(message, 'Pong')
})
//#region Session
test('Login as a free user', async t => {
  const expectedDataStructure = [
    'billing_plan_id',
    'email',
    'email_status',
    'is_premium',
    'last_reset',
    'loc_hash',
    'loc_rev',
    'reg_date',
    'session_auth_hash',
    'status',
    'traffic_max',
    'traffic_used',
    'user_id',
    'username',
  ]
  // Grab the data object
  const data = await api.session.login({
    username: process.env.WS_USER_FREE,
    password: process.env.WS_USER_PASS,
    sessionType: api.codes.sessionTypes.ext,
  })
  // Check if the data structure is expected
  t.deepEqual(expectedDataStructure.sort(), Object.keys(data).sort())

  api.setConfig({
    sessionAuthHash: data.session_auth_hash,
    sessionType: api.codes.sessionTypes.ext,
    dispatch: () => {},
  })
})

test('Login as a pro user', async t => {
  const expectedDataStructure = [
    'billing_plan_id',
    'email',
    'email_status',
    'is_premium',
    'last_reset',
    'loc_hash',
    'loc_rev',
    'premium_expiry_date',
    'rebill',
    'reg_date',
    'session_auth_hash',
    'status',
    'traffic_max',
    'traffic_used',
    'user_id',
    'username',
  ]
  // Grab the data object
  const data = await api.session.login({
    username: process.env.WS_USER_PRO,
    password: process.env.WS_USER_PASS,
    sessionType: api.codes.sessionTypes.ext,
  })
  // Check if is_premium is 1
  t.is(data.is_premium, 1)

  // Check data structure
  await t.deepEqual(expectedDataStructure.sort(), Object.keys(data).sort())
})

test('Wrong password should fail', async t => {
  const err = await t.throws(
    api.session.login({
      username: process.env.WS_USER_PRO,
      password: 'Bad password',
      sessionType: api.codes.sessionTypes.ext,
    }),
  )
  // Validate the error code is 702 for invalid password
  t.is(err.code, 702)
})

test('Get user Session', async t => {
  await loginHelper()
  await t.notThrows(api.session.get)
})
//#endregion

//#region ServerCredentials
test('Fetch sever credentials', async t => {
  const expectedDataStructure = ['username', 'password']
  await loginHelper()
  const serverCredentials = await api.serverCredentials.get()
  await t.deepEqual(expectedDataStructure, Object.keys(serverCredentials))

  // Check types
  Object.keys(serverCredentials).forEach(item => {
    t.is(typeof item, 'string')
  })
})
//#endregion

//#region Send Request
test('Fetch from an arbitrary url', async t => {
  await t.notThrows(
    api.sendRequest({ endpoint: 'https://jsonplaceholder.typicode.com/posts' }),
  )
})

test('Attempt to fetch from a invalid url', async t => {
  const err = await t.throws(
    api.sendRequest({ endpoint: 'ftp://url-not-there' }),
  )
  t.is(err.message, 'Error fetching url')
})
//#endregion

//#region Notification
test('Can get notifications', async t => {
  await loginHelper()
  const data = await api.notifications.get()
  await t.true(Array.isArray(data.notifications))
})
//#endregion

//#region Users
test('Create user', async t => {
  const username = `test_${Date.now()}`
  const userInfo = await api.users.createAccount({
    username,
    password: 'test#pass$',
    sessionType: 1,
  })
  t.is(userInfo.username, username)
})

test('Duplicate user', async t => {
  const err = await t.throws(
    api.users.createAccount({
      username: process.env.WS_USER_FREE,
      password: 'test#pass$',
      sessionType: 1,
    }),
  )
  t.is(err.message, 'Awww! This username is taken.')
})

test('Change password', async t => {
  const username = `test_${Date.now()}`
  const password = 'test#pass$'
  const userInfo = await api.users.createAccount({
    username,
    password,
    sessionType: 1,
  })
  t.is(userInfo.username, username)
  const data = await api.session.login({
    username,
    password,
    sessionType: 1,
  })
  api.setConfig({ sessionAuthHash: data.session_auth_hash, sessionType: 1 })

  t.throws(
    api.users.changePassword({
      password,
      currentPassword: 'notright',
    }),
  )
  const status = await api.users.changePassword({
    password: 'password1',
    currentPassword: password,
  })
  t.is(status.password_updated, 1)
})

test('Change & delete email', async t => {
  const email = `test21_${Date.now()}@windscribe.com`
  await loginHelper()
  let status = await api.users.changeEmailAddress({
    email,
    currentPassword: process.env.WS_USER_PASS,
  })
  t.is(status.email, email)
  status = await api.users.deleteEmailAddress()
  t.falsy(status.email)
})

test('Invalid voucher', async t => {
  const voucherCode = '123ABCXY'
  await loginHelper()
  const status = await api.users.applyVoucher({
    voucherCode,
  })
  t.false(status.voucher_claimed)
  t.false(status.voucher_taken)
  t.false(status.voucher_used)
})

test('Reapply used voucher', async t => {
  const voucherCode = '4GTR8XA9'
  await loginHelper()
  const status = await api.users.applyVoucher({
    voucherCode,
  })

  t.false(status.voucher_claimed)
  t.true(status.voucher_taken)
  t.false(status.voucher_used)
})

//#endregion

//#region Server List
test('Get Extension List', async t => {
  const loc_hash = await loginHelper()
  const extensionList = (
    await api.serverList.get({
      type: 'chrome',
      premium: 1,
      revision: loc_hash,
    })
  ).data
  t.truthy(extensionList.length)
  t.truthy(extensionList[0].groups)
})

test('Get Desktop List', async t => {
  const loc_hash = await loginHelper()
  const desktopList = (
    await api.serverList.get({
      type: 'openvpn',
      premium: 1,
      revision: loc_hash,
    })
  ).data
  t.truthy(desktopList.length)
  t.truthy(desktopList[0].nodes)
})
//#endregion

//#region RecordInstall

test('Record install', async t => {
  await loginHelper()
  const record = await api.recordInstall.post({
    type: 'ext',
    os: 'chrome',
  })
  t.is(record.success, 1)
})

//#endregion

//#region Ghost mode
test('Get Reg token', async t => {
  const token = await api.regToken.getToken()
  console.log(token.token)
  t.truthy(token.token)
})

test('Create ghost account', async t => {
  const token = await api.regToken.getToken()
  t.truthy(token.token)

  const userInfo = await api.users.createGhost({
    token: token.token,
    sessionType: 1,
  })
  t.is(userInfo.username, null)
})
//#endregion
