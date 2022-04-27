/* global store, actions */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should enable adblock',
    eval: async () => {
      const enabledLists = window.store.getState().blockListsEnabled

      if (enabledLists.length !== 0) {
        await window.helpers.removeLists(enabledLists)
      }

      store.dispatch(actions.blockListsEnabled.toggle('adblock'))

      await window.sleep(300)

      return [
        store.getState().blockListsEnabled,
        µBlock.selectedFilterLists.find(x => x.includes('easylist.txt')),
      ]
    },
    assert: ([enabled, filters]) => {
      expect(enabled).includes('adblock')
      expect(filters).to.have.lengthOf.greaterThan(0)
    },
  },
  {
    it: 'should enable antiTracker',
    eval: async () => {
      const enabledLists = window.store.getState().blockListsEnabled

      if (enabledLists.length !== 0) {
        await window.helpers.removeLists(enabledLists)
      }

      store.dispatch(actions.blockListsEnabled.toggle('trackers'))

      await window.sleep(300)

      return [
        store.getState().blockListsEnabled,
        µBlock.selectedFilterLists.find(x => x.includes('easyprivacy.txt')),
      ]
    },
    assert: ([enabled, filters]) => {
      expect(enabled).includes('trackers')
      expect(filters).to.have.lengthOf.greaterThan(0)
    },
  },
  // /* Content scripts are super hard to test so we're disabling for now */
  // {
  //   it: 'should open adTest and adblock should be off',
  //   eval: async () => {
  //     let listener = cb => x => {
  //       if (x.namespace === 'WS_EXT_TEST_SUITE') {
  //         cb(x.payload.adBlockDetected)

  //         browser.runtime.onMessage.removeListener(listener)
  //       }
  //     }

  //     let [{ id }, adBlockDetected] = await Promise.all([
  //       browser.tabs.create({ url: 'http://localhost:1337/adtest/' }),
  //       new Promise(resolve => {
  //         browser.runtime.onMessage.addListener(listener(resolve))
  //       }),
  //     ])

  //     await browser.tabs.remove(id)
  //     await window.sleep(1000)

  //     return [adBlockDetected, µBlock.selectedFilterLists]
  //   },
  //   assert: ([adBlockDetected, s]) =>
  //     console.log(adBlockDetected) || assert.equal(adBlockDetected, false),
  // },
  // {
  //   it: 'should open adTest and adblock should be detected',
  //   eval: async () => {
  //     /* All blocklists should be removed by 'should remove all blocklists' */
  //     if (window.store.getState().uboBlocklist.list.length === 0) {
  //       window.store.dispatch(window.actions.uboBlocklist.add('adBlocker'))
  //     }

  //     await window.sleep(1000)

  //     let listener = cb => x => {
  //       if (x.namespace === 'WS_EXT_TEST_SUITE') {
  //         cb(x.payload.adBlockDetected)

  //         browser.runtime.onMessage.removeListener(listener)
  //       }
  //     }

  //     let [{ id }, adBlockDetected] = await Promise.all([
  //       browser.tabs.create({ url: 'http://localhost:1337/adtest/' }),
  //       new Promise(resolve => {
  //         browser.runtime.onMessage.addListener(listener(resolve))
  //       }),
  //     ])

  //     await window.sleep(1000)
  //     await browser.tabs.remove(id)

  //     return [adBlockDetected, µBlock.selectedFilterLists]
  //   },
  //   assert: ([adBlockDetected, s]) =>
  //     console.log(s) || assert.equal(adBlockDetected, true),
  // },
]
