// eslint-disable-next-line no-unused-vars
/* global window */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

const { getState, testServerlist, testServerlistGroup } = require('../helpers')

module.exports = [
  {
    name: 'show 2FA',
    target: 'chrome',
    it: 'should show 2FA',
    run: async popup => {
      await popup.click('button[name="login"]')
      await popup.waitFor(2000)
      await popup.click('button[name="open2FA"]')
      const openTwoFAInput = await popup.$('input[name="2FA"]')
      await popup.waitFor(2000)
      await popup.click('button[name="close2FA"]')
      const closeTwoFAInput = await popup.$('input[name="2FA"]')
      return [openTwoFAInput, closeTwoFAInput]
    },
    assert: ([openTwoFAInput, closeTwoFAInput]) => {
      expect(openTwoFAInput).to.not.be.null
      expect(closeTwoFAInput).to.be.null
    },
  },
  {
    name: 'login',
    snapshot: true,
    target: 'chrome',
    it: 'should be able to login',
    run: async popup => {
      const usernameInput = await popup.$('input[name="username"]')
      const passwordInput = await popup.$('input[name="password"]')

      await usernameInput.click({ clickCount: 3 })
      await usernameInput.press('Backspace')
      await usernameInput.type(global.TEST_USER.username, { delay: 50 }) // Types slower, like a user

      await passwordInput.click({ clickCount: 3 })
      await passwordInput.press('Backspace')
      await passwordInput.type(global.TEST_USER.password, { delay: 50 })

      await popup.click('button[type="submit"]')
      await popup.waitFor(2000)
      const { session } = await getState(popup)

      return [session]
    },
    assert: ([session]) => {
      expect(session.session_auth_hash).to.be.a('string')
    },
  },
  {
    name: 'serverlist',
    target: 'chrome',
    it: 'should have populated the serverlist',
    run: async popup => {
      const { serverList } = await getState(popup)
      return [serverList]
    },
    assert: ([serverList]) => {
      expect(serverList.data).to.be.an('array')

      serverList.data.forEach(list => {
        testServerlist(list)
        list.groups.forEach(group => testServerlistGroup(group))
      })
    },
  },

  {
    target: 'chrome',
    it: 'should save generated server credentials',
    run: async popup => {
      const { serverCredentials } = await getState(popup)
      return serverCredentials
    },
    assert: creds => {
      expect(creds.username).to.be.a('string')
      expect(creds.password).to.be.a('string')
    },
  },
  {
    target: 'chrome',
    it: 'should have dynamically loaded ublock blocklists',
    run: async popup => {
      const { blockLists } = await getState(popup)
      return blockLists.list
    },
    assert: list => {
      list.forEach(l => {
        const sampleListUrl = l.lists[0].url
        expect(sampleListUrl).to.include(
          'https://assets.windscribe.com/extension/ws/',
        )
        expect(sampleListUrl).to.include('.txt')
      })
    },
  },
]
