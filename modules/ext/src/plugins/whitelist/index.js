import logic from './logic'
import { store, actions } from 'state'

export default {
  lexiconEntries: [
    {
      name: 'whitelist',
      initialState: [],
      stashOnLogout: true,
      resolvers: {
        update: state => state,
      },
    },
    {
      name: 'originalWhitelistInfo',
      initialState: null,
    },
  ],
  async initialize() {
    const ACTIVITY = 'whitelist_init'
    const { whitelist } = store.getState()
    if (whitelist.length === 0) {
      const whitelistObject = {
        domain: 'windscribe.com',
        includeAllSubdomains: true,
        allowDirectConnect: false,
        allowAds: true,
        allowCookies: true,
      }
      store.dispatch(
        actions.whitelist.save({
          logActivity: ACTIVITY,
          whitelistObject,
        }),
      )
    }
  },
  logic,
}
