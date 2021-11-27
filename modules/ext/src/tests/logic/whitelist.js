/* global store, window, actions */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should add a new whitelist entry',
    eval: async () => {
      const data = {
        domain: 'google.com',
        includeAllSubdomains: true,
        allowDirectConnect: true,
        allowAds: false,
        allowCookies: false,
      }
      store.dispatch(
        actions.whitelist.save({
          whitelistObject: data,
          logActivity: 'save_whitelist_test',
        }),
      )

      await window.sleep(100)

      const whitelist = store.getState().whitelist

      return [whitelist.find(d => d.domain === data.domain), data, whitelist]
    },
    assert: ([entry, data]) => expect(entry).to.deep.equal(data),
  },
  {
    it: 'should add an entry with dependents',
    eval: async () => {
      const data = {
        domain: 'youtube.com',
        includeAllSubdomains: true,
        allowDirectConnect: true,
        allowAds: false,
        allowCookies: false,
      }
      store.dispatch(
        actions.whitelist.save({
          whitelistObject: data,
          logActivity: 'save_whitelist_test',
        }),
      )

      await window.sleep(100)

      const whitelist = store.getState().whitelist

      return [
        whitelist.find(d => d.domain === data.domain),
        whitelist.find(
          d => d.domain === 'googlevideo.com' && d.addedBy === data.domain,
        ),
        data,
      ]
    },
    assert: ([entry, depEntry, data]) => {
      const dep = Object.entries(data).reduce((obj, [k, v]) => {
        if (k === 'domain') {
          obj.domain = 'googlevideo.com'
        } else {
          obj[k] = v
        }

        return obj
      }, {})

      expect(entry).to.deep.equal(data)
      expect(depEntry).to.deep.equal({ ...dep, addedBy: data.domain })
    },
  },
  {
    it: 'should update an entry with dependents',
    eval: () => {
      const { whitelist } = window.store.getState()
      /* Target the youtube entry */
      const findWsEntry = ({ domain }) => domain === 'youtube.com'

      let entry = whitelist.find(findWsEntry)

      if (!entry) {
        entry = {
          domain: 'youtube.com',
          includeAllSubdomains: false,
          allowDirectConnect: true,
          allowAds: false,
          allowCookies: true,
        }
        window.store.dispatch(
          window.actions.whitelist.save({
            whitelistObject: entry,
            logActivity: 'save_whitelist_test',
          }),
        )
      }

      window.store.dispatch(
        window.actions.whitelist.update({
          whitelistObject: { ...entry, allowCookies: !entry.allowCookies },
          logActivity: 'update_whitelist_test',
        }),
      )

      const updatedEntry = window.store.getState().whitelist.find(findWsEntry)
      const updatedDep = window.store
        .getState()
        .whitelist.find(x => x.domain === 'googlevideo.com')

      return [entry, updatedEntry, updatedDep]
    },
    assert: ([prevEntry, updatedEntry, dep]) => {
      expect(prevEntry).to.not.equal(updatedEntry)
      expect(dep).to.deep.equal(
        Object.entries(dep).reduce((obj, [k, v]) => {
          if (k === 'domain') {
            obj.domain = dep.domain
          } else {
            obj[k] = v
          }

          return obj
        }, {}),
      )
    },
  },
  {
    it: 'should remove an entry with dependents',
    eval: async () => {
      const { whitelist } = window.store.getState()

      let entry = whitelist.find(({ domain }) => domain === 'youtube.com')

      if (!entry) {
        entry = {
          domain: 'youtube.com',
          includeAllSubdomains: false,
          allowDirectConnect: true,
          allowAds: false,
          allowCookies: true,
        }
        window.store.dispatch(
          window.actions.whitelist.save({
            whitelistObject: entry,
            logActivity: 'save_whitelist_test',
          }),
        )
      }

      window.store.dispatch(
        window.actions.whitelist.pop({
          domain: entry.domain,
          logActivity: 'remove_whitelist_test',
        }),
      )

      await window.sleep(100)

      const updatedWhitelist = store.getState().whitelist

      const hasDomain = updatedWhitelist.find(x => x.domain === 'youtube.com')
      const hasDep = updatedWhitelist.find(x => x.domain === 'googlevideo.com')

      return [hasDomain, hasDep]
    },
    assert: ([hasDomain, hasDep]) => {
      expect(hasDomain).to.be.equal(null)
      expect(hasDep).to.be.equal(null)
    },
  },
  // {
  //   it: 'should add a new whitelist entry to allow ads',
  //   eval: async () => {
  //     let data = {
  //       domain: 'cnn.com',
  //       includeAllSubdomains: true,
  //       allowDirectConnect: false,
  //       allowAds: true,
  //       allowCookies: false,
  //     }
  //     store.dispatch(actions.whitelist.save(data))

  //     let whitelist = store.getState().whitelist
  //     //let uboEntry = µBlock.netWhitelist[data.domain]
  //     let uboEntry = µBlock.selectedFilterLists

  //     return [whitelist.find(d => d.domain === data.domain), data, uboEntry]
  //   },
  //   assert: ([entry, data, uboEntry]) => {
  //     expect(entry).to.deep.equal(data)
  //     if (data.includeAllSubdomains) {
  //       expect(`*${data.domain}/*`).to.equal(uboEntry)
  //     } else {
  //       expect(data.domain).to.equal(uboEntry)
  //     }
  //   },
  // },
  {
    it: 'should update an entry',
    eval: async () => {
      const { whitelist } = window.store.getState()
      /* Target the initial windscribe entry */
      const findWsEntry = ({ domain }) => domain === 'windscribe.com'

      let entry = whitelist.find(findWsEntry)

      if (!entry) {
        entry = {
          domain: 'windscribe.com',
          includeAllSubdomains: false,
          allowDirectConnect: true,
          allowAds: false,
          allowCookies: true,
        }
        window.store.dispatch(
          window.actions.whitelist.save({
            whitelistObject: entry,
            logActivity: 'save_whitelist_test',
          }),
        )
      }

      window.store.dispatch(
        window.actions.whitelist.update({
          whitelistObject: { ...entry, allowCookies: !entry.allowCookies },
          logActivity: 'update_whitelist_test',
        }),
      )

      await window.sleep(100)

      const updatedEntry = window.store.getState().whitelist.find(findWsEntry)

      return [entry, updatedEntry]
    },
    assert: ([prevEntry, updatedEntry]) => {
      expect(prevEntry).to.not.equal(updatedEntry)
    },
  },
]
