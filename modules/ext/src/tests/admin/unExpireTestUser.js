/* global store, actions, sleep */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect
const { adminApi, ACCOUNT_STATES } = require('./index')

module.exports = {
  name: 'unExpireTestUser',
  target: 'chrome',
  it: 'should unexpire a test user',
  before: async () => {
    try {
      await adminApi.users.put({
        userId: global.TEST_USER_ID,
        status: ACCOUNT_STATES.ACTIVE,
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  },
  eval: async () => {
    await sleep(1000)
    store.dispatch(actions.session.get())

    await sleep(3000)

    const { session } = store.getState()

    return [session]
  },
  assert: ([response]) => {
    expect(response.status).to.equal(1)
  },
}
