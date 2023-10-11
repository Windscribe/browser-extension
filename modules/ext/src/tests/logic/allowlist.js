/* global store, window, actions */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should add a new allowlist entry',
    eval: async () => {
      const data = {
        domain: 'google.com',
        includeAllSubdomains: true,
        allowDirectConnect: true,
        allowAds: false,
        allowCookies: false,
      }
      store.dispatch(
        actions.allowlist.save({
          allowlistObject: data,
          logActivity: 'save_allowlist_test',
        }),
      )

      await window.sleep(100)

      const allowlist = store.getState().allowlist

      return [allowlist.find(d => d.domain === data.domain), data, allowlist]
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
        actions.allowlist.save({
          allowlistObject: data,
          logActivity: 'save_allowlist_test',
        }),
      )

      await window.sleep(100)

      const allowlist = store.getState().allowlist

      return [
        allowlist.find(d => d.domain === data.domain),
        allowlist.find(
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
      const { allowlist } = window.store.getState()
      /* Target the youtube entry */
      const findWsEntry = ({ domain }) => domain === 'youtube.com'

      let entry = allowlist.find(findWsEntry)

      if (!entry) {
        entry = {
          domain: 'youtube.com',
          includeAllSubdomains: false,
          allowDirectConnect: true,
          allowAds: false,
          allowCookies: true,
        }
        window.store.dispatch(
          window.actions.allowlist.save({
            allowlistObject: entry,
            logActivity: 'save_allowlist_test',
          }),
        )
      }

      window.store.dispatch(
        window.actions.allowlist.update({
          allowlistObject: { ...entry, allowCookies: !entry.allowCookies },
          logActivity: 'update_allowlist_test',
        }),
      )

      const updatedEntry = window.store.getState().allowlist.find(findWsEntry)
      const updatedDep = window.store
        .getState()
        .allowlist.find(x => x.domain === 'googlevideo.com')

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
      const { allowlist } = window.store.getState()

      let entry = allowlist.find(({ domain }) => domain === 'youtube.com')

      if (!entry) {
        entry = {
          domain: 'youtube.com',
          includeAllSubdomains: false,
          allowDirectConnect: true,
          allowAds: false,
          allowCookies: true,
        }
        window.store.dispatch(
          window.actions.allowlist.save({
            allowlistObject: entry,
            logActivity: 'save_allowlist_test',
          }),
        )
      }

      window.store.dispatch(
        window.actions.allowlist.pop({
          domain: entry.domain,
          logActivity: 'remove_allowlist_test',
        }),
      )

      await window.sleep(100)

      const updatedAllowlist = store.getState().allowlist

      const hasDomain = updatedAllowlist.find(x => x.domain === 'youtube.com')
      const hasDep = updatedAllowlist.find(x => x.domain === 'googlevideo.com')

      return [hasDomain, hasDep]
    },
    assert: ([hasDomain, hasDep]) => {
      expect(hasDomain).to.be.equal(null)
      expect(hasDep).to.be.equal(null)
    },
  },
  // {
  //   it: 'should add a new allowlist entry to allow ads',
  //   eval: async () => {
  //     let data = {
  //       domain: 'cnn.com',
  //       includeAllSubdomains: true,
  //       allowDirectConnect: false,
  //       allowAds: true,
  //       allowCookies: false,
  //     }
  //     store.dispatch(actions.allowlist.save(data))

  //     let allowlist = store.getState().allowlist
  //     //let uboEntry = µBlock.netWhitelist[data.domain]
  //     let uboEntry = µBlock.selectedFilterLists

  //     return [allowlist.find(d => d.domain === data.domain), data, uboEntry]
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
      const { allowlist } = window.store.getState()
      /* Target the initial windscribe entry */
      const findWsEntry = ({ domain }) => domain === 'windscribe.com'

      let entry = allowlist.find(findWsEntry)

      if (!entry) {
        entry = {
          domain: 'windscribe.com',
          includeAllSubdomains: false,
          allowDirectConnect: true,
          allowAds: false,
          allowCookies: true,
        }
        window.store.dispatch(
          window.actions.allowlist.save({
            allowlistObject: entry,
            logActivity: 'save_allowlist_test',
          }),
        )
      }

      window.store.dispatch(
        window.actions.allowlist.update({
          allowlistObject: { ...entry, allowCookies: !entry.allowCookies },
          logActivity: 'update_allowlist_test',
        }),
      )

      await window.sleep(100)

      const updatedEntry = window.store.getState().allowlist.find(findWsEntry)

      return [entry, updatedEntry]
    },
    assert: ([prevEntry, updatedEntry]) => {
      expect(prevEntry).to.not.equal(updatedEntry)
    },
  },
]
