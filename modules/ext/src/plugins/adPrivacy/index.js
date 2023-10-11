import { store, actions } from 'state'

export default {
  lexiconEntries: [
    {
      name: 'adPrivacyEnabled',
      stashOnLogout: true,
      initialState: true,
    },
  ],
  async initialize() {
    const { adPrivacyEnabled } = store.getState()
    if (adPrivacyEnabled) {
      store.dispatch(
        actions.adPrivacyEnabled.set({
          value: adPrivacyEnabled,
        }),
      )
    }
  },
  logic: actions => [
    {
      type: [actions.adPrivacyEnabled.setandlog, actions.adPrivacyEnabled.set],
      latest: true,
      async process({ action }, dispatch, done) {
        if (action.payload?.value) {
          browser.privacy.websites.topicsEnabled.set({
            value: !action.payload?.value,
          })
          browser.privacy.websites.adMeasurementEnabled.set({
            value: !action.payload?.value,
          })
          browser.privacy.websites.fledgeEnabled.set({
            value: !action.payload?.value,
          })
        } else {
          browser.privacy.websites.topicsEnabled.clear({})
          browser.privacy.websites.adMeasurementEnabled.clear({})
          browser.privacy.websites.fledgeEnabled.clear({})
        }

        done()
      },
    },
  ],
}
