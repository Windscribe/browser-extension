/* global store */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    target: 'chrome',
    it: 'should be able to logout',
    eval: async () => {
      await window.logout({ clearLog: false })
      return [store.getState().session]
    },
    assert: ([session]) => {
      expect(session.username).to.be.undefined
    },
  },
]
