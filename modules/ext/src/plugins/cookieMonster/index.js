import { COOKIE_MONSTER_ENABLED } from 'utils/constants'
import { uniqWith, isEqual } from 'lodash'
import { store, actions } from 'state'
import domainExistsInAllowlist from 'utils/domainExistsInAllowlist'
import * as utils from './utils'
import format from 'plugins/tabs/format'
export default {
  lexiconEntries: [
    {
      name: 'cookieMonsterEnabled',
      stashOnLogout: true,
      initialState: COOKIE_MONSTER_ENABLED || false,
    },
    {
      name: 'cookieMonsterOnlyThirdParty',
      stashOnLogout: true,
      initialState: true,
    },
  ],
  async onTabRemoved(id) {
    const {
      cookieMonsterEnabled,
      cookieMonsterOnlyThirdParty,
      tabs,
      allowlist,
    } = store.getState()

    // TODO: check if another tab is on the same domain, if so return early

    const tab = tabs[id]
    if (!tab) return

    const isAllowlisted = domainExistsInAllowlist({
      allowlist,
      url: tab.url,
      domain: format(tab).hostname,
    })

    if (cookieMonsterEnabled && !isAllowlisted) {
      const { firstParty, thirdParty } = await utils.collectCookies({
        tab,
        cookieMonsterOnlyThirdParty,
      })

      // -
      ;[...firstParty, ...thirdParty].forEach(cookie => {
        try {
          const url = new URL(
            `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
          )

          browser.cookies.remove({ url: url.href, name: cookie.name })

          // TODO: make sure this works in firefox.. it has a slightly different api
        } catch (err) {
          console.error(err)
        }
      })
    }
  },
  onWebRequestHeadersReceived({ tabId, responseHeaders, initiator }) {
    const { dispatch } = store
    if (
      !initiator ||
      ['chrome-extension:', 'chrome:', 'about:', 'moz-extension:'].some(p =>
        initiator.startsWith(p),
      )
    )
      return

    const cookie = responseHeaders.find(x => x.name === 'set-cookie')

    if (cookie) {
      const tab = store.getState().tabs[tabId]
      dispatch(
        actions.tabs.produce(state => {
          ;(state[tabId] || []).cookies = uniqWith(
            [
              ...(tab?.cookies || []),
              utils.parseCookie(cookie.value, initiator),
            ],
            isEqual,
          )
        }),
      )
    }
  },
  onMessage: {
    'found-iframe'(message, { sender }) {
      /* track iframes per tab. they might set cookies via javascript and we'll
      want to remove any cookies associated with those iframe domains, provided
      that cookieMonster is enabled */
      const { id } = sender.tab
      const { tabs } = store.getState()
      const tab = tabs[id]

      store.dispatch(
        actions.tabs.produce(state => {
          ;(state[id] || {}).iframeUrls = [
            ...(tab?.iframeUrls || []),
            message.payload,
          ]
        }),
      )
    },
  },
  utils,
}
