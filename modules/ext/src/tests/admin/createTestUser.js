const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect
const { api } = require('./index')

module.exports = {
  name: 'create new test user',
  target: 'chrome',
  it: 'should create a new test user',
  run: async () => {
    if (global.CREATED_TEST_USER) {
      return [global.TEST_USER]
    }
    try {
      const res = await api.users.createAccount({
        ...global.TEST_USER,
        sessionType: 2,
      })
      global.CREATED_TEST_USER = true
      global.TEST_USER_ID = res.user_id
      return [res]
    } catch (e) {
      console.error(e)
      throw e
    }
  },
  assert: ([response]) => {
    expect(response.username).to.equal(global.TEST_USER.username)
  },
}
