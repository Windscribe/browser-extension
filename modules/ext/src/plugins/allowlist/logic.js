import { createAction } from 'redux-actions'
import sleep from 'shleep'
import { isEqual } from 'lodash'
import { getDomain } from 'utils/parse-suffix-list'
import pushToDebugLog from 'utils/debugLogger'
import { ALLOWLIST_DOMAIN_TABLE } from 'utils/constants'
import listen from 'utils/listen'
import allowlistCheck from 'utils/allowlistCheck'

listen(browser.webNavigation.onCommitted, allowlistCheck)

const updateArrayElement = (array, filter, updateData) => {
  const arrayIndex = array.findIndex(filter)
  return Object.assign([...array], {
    [arrayIndex]: updateData,
  })
}

const localActions = {
  setShouldReloadPage: createAction('SET_SHOULD_RELOAD_PAGE'),
}

const updateUboAllowlist = obj => {
  µBlock.netWhitelist = new Map(Object.entries(obj))
  sleep(500).then(() => µBlock.saveWhitelist())
}

const domainDependents = domain => {
  const deps = ALLOWLIST_DOMAIN_TABLE?.[getDomain(domain)]

  if (!deps) {
    return []
  } else {
    return deps
  }
}

export default actions => [
  /* Add item to allowlist */
  {
    type: actions.allowlist.save,
    latest: true,
    process({ action, getState }, dispatch, done) {
      const { proxy } = getState()
      const { allowlistObject, logActivity } = action?.payload

      const {
        domain = null,
        includeAllSubdomains,
        allowAds,
        allowDirectConnect,
        allowCookies,
      } = allowlistObject

      if (!domain) {
        pushToDebugLog({
          activity: logActivity,
          message: 'Invalid domain added to allowlist',
        })
        return done()
      }

      const saveAllowlistItem = ({ domain, customSave }) => {
        if (allowAds) {
          const updatedAllowlist = {
            ...Object.fromEntries(µBlock.netWhitelist),
            [domain]: [includeAllSubdomains ? `*${domain}/*` : domain],
          }

          updateUboAllowlist(updatedAllowlist)
        }

        if (allowDirectConnect && proxy.status === 'connected') {
          dispatch(
            actions.proxy.activate({
              silent: true,
              logActivity: 'allow_direct_connect',
            }),
          )
        }

        if (customSave) {
          customSave(domain)
        } else {
          dispatch(actions.allowlist.concat({ ...allowlistObject, domain }))
        }
      }

      dispatch(
        localActions.setShouldReloadPage({
          allowlistEntry: allowlistObject,
        }),
      )

      saveAllowlistItem({ domain })
      const dependentsArray = domainDependents(domain)
      let hasDependents = false
      if (
        dependentsArray.length > 0 &&
        // The dependents should not exist in the allowlist
        !getState().allowlist.find(x => dependentsArray.includes(x.domain))
      ) {
        hasDependents = true
        dependentsArray.forEach(d =>
          saveAllowlistItem({
            domain: d,
            customSave: () =>
              dispatch(
                actions.allowlist.concat({
                  ...allowlistObject,
                  domain: d,
                  addedBy: domain,
                }),
              ),
          }),
        )
      }
      pushToDebugLog({
        activity: logActivity,
        message: `Added new allowlist entry: 
        includeAllSubdomains: ${!!includeAllSubdomains},
        allowAds: ${!!allowAds},
        allowDirectConnect: ${!!allowDirectConnect},
        allowCookies: ${!!allowCookies}
        hasDependents: ${hasDependents}`,
      })
      done()
    },
  },
  /* Delete from allowlist */
  {
    type: actions.allowlist.pop,
    latest: true,
    process({ getState, action }, dispatch, done) {
      const { domain, logActivity } = action.payload

      const pop = domain => {
        const { allowlist, proxy } = getState()

        const updatedList = Object.entries(
          Object.fromEntries(µBlock.netWhitelist),
        )
          .filter(([key]) => key !== domain)
          .reduce((prev, [key, value]) => {
            prev[key] = value

            return prev
          }, {})

        updateUboAllowlist(updatedList)

        const entry = allowlist.find(x => x.domain === domain)

        dispatch(
          actions.allowlist.set(allowlist.filter(x => x.domain !== domain)),
        )

        if (entry?.allowDirectConnect && proxy.status === 'connected') {
          dispatch(
            actions.proxy.activate({
              silent: true,
              logActivity: 'allow_direct_connect',
            }),
          )
        }
      }

      pop(domain)
      const dependentsArray = domainDependents(domain)
      let hasDependents = false
      if (dependentsArray.length > 0) {
        hasDependents = true
        dependentsArray.forEach(pop)
      }

      dispatch(
        localActions.setShouldReloadPage({
          allowlistEntry: {
            domain,
            includeAllSubdomains: true,
            allowAds: false,
            allowDirectConnect: false,
            allowCookies: false,
          },
        }),
      )

      pushToDebugLog({
        activity: logActivity,
        message: `Removed domain from allowlist: 
        hasDependents: ${hasDependents}`,
      })

      done()
    },
  },
  /* Update allowlist item */
  {
    type: actions.allowlist.update,
    process({ getState, action }, dispatch, done) {
      const { allowlistObject, logActivity } = action.payload

      const {
        allowAds,
        allowDirectConnect,
        domain,
        includeAllSubdomains,
        allowCookies,
      } = allowlistObject

      const handleUpdate = domain => {
        const { allowlist, proxy } = getState()
        const [oldAllowlist] = allowlist.filter(d => domain === d.domain)
        const updatedAllowlist = { ...allowlistObject, domain }
        const t = updateArrayElement(
          allowlist,
          d => d.domain === domain,
          updatedAllowlist,
        )

        dispatch(actions.allowlist.set(t))

        if (isEqual(updatedAllowlist, oldAllowlist)) {
          return done()
        }

        if (allowAds) {
          updateUboAllowlist({
            ...Object.fromEntries(µBlock.netWhitelist),
            [domain]: [includeAllSubdomains ? `*${domain}/*` : domain],
          })
        } else {
          updateUboAllowlist(
            Object.entries(Object.fromEntries(µBlock.netWhitelist))
              .filter(([key]) => key !== domain)
              .reduce((prev, [key, value]) => {
                prev[key] = value

                return prev
              }, {}),
          )
        }

        const allowDirectConnectChanged =
          allowDirectConnect &&
          !isEqual(allowDirectConnect, oldAllowlist?.allowDirectConnect)

        const includeAllSubdomainsChanged = !isEqual(
          includeAllSubdomains,
          oldAllowlist?.includeAllSubdomains,
        )

        const shouldReloadProxy =
          allowDirectConnectChanged || includeAllSubdomainsChanged

        if (shouldReloadProxy && proxy.status === 'connected') {
          dispatch(
            actions.proxy.activate({
              silent: true,
              logActivity: 'allow_direct_connect',
            }),
          )
        }
      }

      dispatch(
        localActions.setShouldReloadPage({
          allowlistEntry: allowlistObject,
        }),
      )

      handleUpdate(domain)
      const dependentsArray = domainDependents(domain)
      let hasDependents = false
      if (dependentsArray.length > 0) {
        hasDependents = true
        dependentsArray.forEach(handleUpdate)
      }

      pushToDebugLog({
        activity: logActivity,
        message: `Updated allowlist entry: 
        includeAllSubdomains: ${!!includeAllSubdomains},
        allowAds: ${!!allowAds},
        allowDirectConnect: ${!!allowDirectConnect},
        allowCookies: ${!!allowCookies}
        hasDependents: ${hasDependents}`,
      })

      done()
    },
  },
  /* Entirely dependent on allowlist [probably not the best place to put it however]
    This just sets the shouldReloadPage value on tab
    */
  {
    type: localActions.setShouldReloadPage,
    latest: true,
    process({ getState, action }, dispatch, done) {
      let shouldIt = true
      const { allowlistEntry } = action.payload
      const { activeTabId, tabs, originalAllowlistInfo } = getState()

      if (originalAllowlistInfo) {
        shouldIt = !isEqual(originalAllowlistInfo, allowlistEntry)
      } else {
        dispatch(actions.originalAllowlistInfo.set(allowlistEntry))
      }

      // the entry must match your current tab url
      // this is because you can 'set' _any_ entry via wl prefs page
      // should also be set to false if you've started to add new entries (to avoid it being there persistently)
      if (
        allowlistEntry &&
        !tabs[activeTabId]?.url.includes(allowlistEntry.domain)
      ) {
        shouldIt = false
      }

      if (activeTabId) {
        dispatch(
          actions.tabs.produce(tabState => {
            tabState[activeTabId].shouldReloadPage = shouldIt
          }),
        )
      }

      done()
    },
  },
]
