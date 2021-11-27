import { store, actions } from 'state'
import { IS_CHROME } from 'utils/constants'
import pushToDebugLog from 'utils/debugLogger'

const { webRTCIPHandlingPolicy } = browser.privacy.network

export default {
  lexiconEntries: [
    {
      name: 'webRTC',
    },
    {
      name: 'webRTCEnabled',
      stashOnLogout: true,
      initialState: false,
    },
  ],
  async initialize() {
    const { webRTCEnabled } = store.getState()
    if (webRTCEnabled) {
      store.dispatch(actions.webRTC.activate())
    }
  },
  logic: actions => [
    {
      type: actions.webRTC.activate,
      latest: true,
      process(store, dispatch, done) {
        browser.privacy.network.webRTCIPHandlingPolicy
          .get({})
          .then(function (details) {
            pushToDebugLog({
              activity: 'webrtc_settings',
              message: `webRTC settings: ${JSON.stringify(details)}`,
            })
          })
        if (IS_CHROME) {
          webRTCIPHandlingPolicy
            .set({
              value: browser.privacy.IPHandlingPolicy.DISABLE_NON_PROXIED_UDP,
            })
            .then(done)
        } else {
          webRTCIPHandlingPolicy.set({ value: 'proxy_only' }).then(done)
        }
      },
    },
    {
      type: [actions.webRTC.deactivate, actions.auth.logout],
      latest: true,
      process(store, dispatch, done) {
        webRTCIPHandlingPolicy.set({ value: 'default' }).then(done)
      },
    },
  ],
}
