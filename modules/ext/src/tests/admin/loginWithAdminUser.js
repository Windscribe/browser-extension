const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect
const { adminApi } = require('./index')

module.exports = {
  name: 'log in with admin user',
  target: 'chrome',
  it: 'Using env config, log in as admin',
  run: async () => {
    // creates super user for tests that request manipulation of previously created user
    if (global.ADMIN_USER) {
      return true
    }

    try {
      const res = await adminApi.session.login({
        username: process.env.TEST_ADMIN_USER,
        password: process.env.TEST_ADMIN_PASSWORD,
        sessionType: 1,
      })

      // creds are not relevent in tests
      global.ADMIN_USER = true
      await adminApi.setConfig({ sessionAuthHash: res.session_auth_hash })
      return [res]
    } catch (e) {
      throw e
    }
  },
  assert: ([response]) => {
    expect(response)
  },
}
