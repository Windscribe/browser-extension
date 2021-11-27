/* global store, actions, window */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    type: 'chrome',
    it: 'should load with default settings',
    eval: async () => {
      const settings = await new Promise(resolve =>
        browser.proxy.settings.get({}, resolve),
      )

      const { status } = store.getState().proxy

      return [settings, status]
    },
    assert: ([settings, status]) => {
      expect(status).to.equal('disconnected')
      expect(settings.value.mode).to.equal('system')
    },
  },
  {
    name: 'ConnectToDefault',
    type: 'chrome',
    it: 'should have a proxied [different] ip after activate',
    eval: async () => {
      store.dispatch(actions.proxy.deactivate())
      await window.sleep(3000)
      const unProxiedIp = await window.checkIp()
      store.dispatch(actions.proxy.activate()) // remove delays
      await window.sleep(6000)
      const proxiedIp = await window.checkIp()

      return [unProxiedIp, proxiedIp]
    },
    assert: ([initialIp, proxiedIp]) => {
      expect(initialIp).to.not.equal(proxiedIp)
    },
  },
]
