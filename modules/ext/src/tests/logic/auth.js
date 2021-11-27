/* global store */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

const { testServerlist, testServerlistGroup } = require('../helpers')

module.exports = [
  {
    target: 'chrome',
    it: 'should be able to login',
    eval: async ({ testUser }) => {
      await window.login(testUser)
      return [store.getState().session, testUser.username]
    },
    assert: ([session, user]) => {
      expect(session.username).to.equal(user)
      expect(session.session_auth_hash).to.be.a('string')
    },
  },
  {
    target: 'chrome',
    it: 'should have populated the serverlist',
    eval: async () => {
      const { serverList } = store.getState()
      return serverList
    },
    assert: serverList => {
      expect(serverList.data).to.be.an('array')

      serverList.data.forEach(list => {
        testServerlist(list)
        list.groups.forEach(group => testServerlistGroup(group))
      })
    },
  },
  {
    target: 'chrome',
    it: 'should have saved generated server credentials',
    eval: async () => {
      const { serverCredentials } = store.getState()
      return serverCredentials
    },
    assert: serverCredentials => {
      expect(serverCredentials.username).to.be.a('string')
      expect(serverCredentials.password).to.be.a('string')
    },
  },
  {
    target: 'chrome',
    it: 'should have generated a new autopilot list',
    eval: () => store.getState().cruiseControlList.data,
    assert: list => {
      list.forEach(l => {
        testServerlist(l)
        l.groups.forEach(g => testServerlistGroup(g))
        l.domains.forEach(d => expect(d).to.be.a('string'))
      })
    },
  },
]
