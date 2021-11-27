import format from 'plugins/tabs/format'
import { store, actions } from 'state'
import logic from './logic'

export default {
  lexiconEntries: [
    {
      name: 'userAgent',
      initialState: {
        original: null,
        spoofed: null,
        list: null,
      },
    },
    {
      name: 'splitPersonalityEnabled',
      stashOnLogout: true,
      initialState: false,
    },
  ],
  onTabCreated({ id }) {
    this.utils.rewriteUserAgent(id)
  },
  onTabActivated({ tabId }) {
    this.utils.rewriteUserAgent(tabId)
  },
  onTabUpdated(tabId) {
    this.utils.rewriteUserAgent(tabId)
  },
  utils: {
    rewriteUserAgent(tabId) {
      const { userAgent, splitPersonalityEnabled, tabs } = store.getState()
      const { hostnameInvalid } = format(tabs[tabId])

      if (!splitPersonalityEnabled || !userAgent || hostnameInvalid) {
        return
      }

      browser.tabs.executeScript(tabId, {
        runAt: 'document_start',
        code: `
          script = document.createElement('script')
          script.textContent = "Object.defineProperty(window.navigator,'userAgent', { value: '${userAgent.spoofed}', configurable: true })"
          document.documentElement.appendChild(script)

          script.remove()
          delete script
        `,
      })
    },
  },
  async initialize() {
    const { splitPersonalityEnabled } = store.getState()

    if (splitPersonalityEnabled) {
      store.dispatch(actions.userAgent.activate())
    }
  },
  logic,
}
