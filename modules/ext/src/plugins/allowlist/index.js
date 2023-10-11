import logic from './logic'
import { store, actions } from 'state'

export default {
  lexiconEntries: [
    {
      name: 'allowlist',
      initialState: [],
      stashOnLogout: true,
      resolvers: {
        update: state => state,
      },
    },
    {
      name: 'originalAllowlistInfo',
      initialState: null,
    },
  ],
  async initialize() {
    const ACTIVITY = 'allowlist_init'
    const { allowlist } = store.getState()
    if (allowlist.length === 0) {
      const allowlistObject = {
        domain: 'windscribe.com',
        includeAllSubdomains: true,
        allowDirectConnect: false,
        allowAds: true,
        allowCookies: true,
      }
      store.dispatch(
        actions.allowlist.save({
          logActivity: ACTIVITY,
          allowlistObject,
        }),
      )
    }
  },
  logic,
}
