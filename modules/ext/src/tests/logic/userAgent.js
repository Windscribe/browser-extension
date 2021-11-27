/* global store, actions, sleep */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should start split personality',
    eval: async () => {
      /* Start split personality */
      store.dispatch(actions.splitPersonalityEnabled.set(true))
      store.dispatch(actions.userAgent.activate())
      store.dispatch(actions.userAgent.randomize())
      store.dispatch({ type: 'SPLIT_PERSONALITY_START' })

      await sleep(300)
      const { userAgent, splitPersonalityEnabled } = store.getState()

      return [userAgent.spoofed, splitPersonalityEnabled]
    },
    assert: ([userAgent, enabled]) => {
      expect(userAgent).to.be.a('string')
      expect(enabled).to.be.true
    },
  },
  {
    it: 'should rewrite user agent for rest api calls',
    eval: async () => {
      const { userAgent } = store.getState()
      const url = 'http://localhost:1337/userAgent/rest'

      const resp = await new Promise(resolve =>
        fetch(url)
          .then(r => r.text())
          .then(resolve),
      )

      return [userAgent.spoofed, resp]
    },
    assert: ([spoofed, resp]) => expect(spoofed).to.equal(resp),
  },
  {
    it: 'should rewrite navigator.userAgent',
    eval: async () => {
      /* Uhhhhhh */
      const openTab = () =>
        browser.tabs.create({ url: 'localhost:1337/userAgent/' })
      const listener = resolve => d => {
        if (d.namespace !== 'ws-test') {
          return
        }

        return resolve(d)
      }
      const getMessage = () =>
        new Promise(resolve =>
          browser.runtime.onMessage.addListener(listener(resolve)),
        )

      const { id } = await openTab()
      const { payload } = await getMessage()

      /* Cleanup */
      browser.runtime.onMessage.removeListener(listener)
      browser.tabs.remove(id)

      const { userAgent } = store.getState()

      return [userAgent.spoofed, payload]
    },
    assert: ([spoofed, navigators]) => expect(spoofed).to.equal(navigators),
  },
]
