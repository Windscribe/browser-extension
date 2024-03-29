import { store, actions } from 'state'
import pushToDebugLog from 'utils/debugLogger'
import { IS_CHROME } from 'utils/constants'
import api from 'api'

export default {
  initialize() {
    // for when app is first installed
    if (!store.getState().firstInstallDate) {
      //check if session from old extension exists
      const oldExtDataString = localStorage.getItem('wsextension_userInfo')
      if (oldExtDataString) {
        try {
          const oldExtData = JSON.parse(oldExtDataString)
          if (oldExtData.session_auth_hash) {
            pushToDebugLog({
              activity: 'migrate_old_ext_data',
              message: `old session found, logging in`,
            })
            store.dispatch(actions.auth.autologin(oldExtData.session_auth_hash))
          }
        } catch (e) {}
      } else {
        //record the install, since this is not an ext update
        pushToDebugLog({
          activity: 'record_install',
          message: `sending record install api call`,
        })
        try {
          const extOS = IS_CHROME ? 'chrome' : 'firefox'
          api.recordInstall.post({ type: 'ext', os: extOS })
        } catch (err) {
          pushToDebugLog({
            activity: 'record_install',
            message: `record install fetch error: ${err.toString()}`,
          })
        }
      }
      //migrate any old allowlist data
      const oldAllowlistDataString = localStorage.getItem(
        'wsextension_listsInfo',
      )
      if (oldAllowlistDataString) {
        try {
          const oldAllowlistData = JSON.parse(oldAllowlistDataString)
          const wlItems = {}
          oldAllowlistData.lists.allowList.forEach(domain => {
            wlItems[domain] = {
              domain,
              includeAllSubdomains: true,
              allowAds: true,
              allowDirectConnect: false,
              allowCookies: false,
            }
          })
          oldAllowlistData.lists.proxyAllowList.forEach(domain => {
            if (wlItems[domain]) {
              wlItems[domain] = {
                ...wlItems[domain],
                allowDirectConnect: true,
              }
            } else {
              wlItems[domain] = {
                domain,
                includeAllSubdomains: true,
                allowAds: false,
                allowDirectConnect: true,
                allowCookies: false,
              }
            }
          })
          oldAllowlistData.lists.cookieAllowList.forEach(domain => {
            if (wlItems[domain]) {
              wlItems[domain] = {
                ...wlItems[domain],
                allowCookies: true,
              }
            } else {
              wlItems[domain] = {
                domain,
                includeAllSubdomains: true,
                allowAds: false,
                allowDirectConnect: false,
                allowCookies: true,
              }
            }
          })
          pushToDebugLog({
            activity: 'migrate_old_ext_data',
            message: `allowlist items to import: ${JSON.stringify(wlItems)}`,
          })
          try {
            delete wlItems['windscribe.com']
          } catch (e) {}
          Object.values(wlItems).forEach(item =>
            store.dispatch(
              actions.allowlist.save({
                allowlistObject: item,
                logActivity: 'migrate_allowlist',
              }),
            ),
          )
        } catch (e) {}
      }
    }
  },
}
