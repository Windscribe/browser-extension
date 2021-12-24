import { createAction } from 'redux-actions'
import sleep from 'shleep'
import { isEqual } from 'lodash'
import { getDomain } from 'utils/parse-suffix-list'
import pushToDebugLog from 'utils/debugLogger'
import { WHITELIST_DOMAIN_TABLE } from 'utils/constants'
import listen from 'utils/listen'
import whitelistCheck from 'utils/whitelistCheck'

listen(browser.webNavigation.onCommitted, whitelistCheck)

const updateArrayElement = (array, filter, updateData) => {
  const arrayIndex = array.findIndex(filter)
  return Object.assign([...array], {
    [arrayIndex]: updateData,
  })
}

const localActions = {
  setShouldReloadPage: createAction('SET_SHOULD_RELOAD_PAGE'),
}

const updateUboWhitelist = obj => {
  µBlock.netWhitelist = new Map(Object.entries(obj))
  sleep(500).then(() => µBlock.saveWhitelist())
}

const domainDependents = domain => {
  const deps = WHITELIST_DOMAIN_TABLE?.[getDomain(domain)]

  if (!deps) {
    return []
  } else {
    return deps
  }
}

export default actions => [
  /* Add item to whitelist */
  {
    type: actions.whitelist.save,
    latest: true,
    process({ action, getState }, dispatch, done) {
      const { proxy } = getState()
      const { whitelistObject, logActivity } = action?.payload

      const {
        domain = null,
        includeAllSubdomains,
        allowAds,
        allowDirectConnect,
        allowCookies,
      } = whitelistObject

      if (!domain) {
        pushToDebugLog({
          activity: logActivity,
          message: 'Invalid domain added to whitelist',
        })
        return done()
      }

      const saveWhitelistItem = ({ domain, customSave }) => {
        if (allowAds) {
          const updatedWhitelist = {
            ...Object.fromEntries(µBlock.netWhitelist),
            [domain]: [includeAllSubdomains ? `*${domain}/*` : domain],
          }

          updateUboWhitelist(updatedWhitelist)
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
          dispatch(actions.whitelist.concat({ ...whitelistObject, domain }))
        }
      }

      dispatch(
        localActions.setShouldReloadPage({
          whitelistEntry: whitelistObject,
        }),
      )

      saveWhitelistItem({ domain })
      const dependentsArray = domainDependents(domain)
      let hasDependents = false
      if (
        dependentsArray.length > 0 &&
        // The dependents should not exist in the whitelist
        !getState().whitelist.find(x => dependentsArray.includes(x.domain))
      ) {
        hasDependents = true
        dependentsArray.forEach(d =>
          saveWhitelistItem({
            domain: d,
            customSave: () =>
              dispatch(
                actions.whitelist.concat({
                  ...whitelistObject,
                  domain: d,
                  addedBy: domain,
                }),
              ),
          }),
        )
      }
      pushToDebugLog({
        activity: logActivity,
        message: `Added new whitelist entry: 
        includeAllSubdomains: ${!!includeAllSubdomains},
        allowAds: ${!!allowAds},
        allowDirectConnect: ${!!allowDirectConnect},
        allowCookies: ${!!allowCookies}
        hasDependents: ${hasDependents}`,
      })
      done()
    },
  },
  /* Delete from whitelist */
  {
    type: actions.whitelist.pop,
    latest: true,
    process({ getState, action }, dispatch, done) {
      const { domain, logActivity } = action.payload

      const pop = domain => {
        const { whitelist, proxy } = getState()

        const updatedList = Object.entries(
          Object.fromEntries(µBlock.netWhitelist),
        )
          .filter(([key]) => key !== domain)
          .reduce((prev, [key, value]) => {
            prev[key] = value

            return prev
          }, {})

        updateUboWhitelist(updatedList)

        const entry = whitelist.find(x => x.domain === domain)

        dispatch(
          actions.whitelist.set(whitelist.filter(x => x.domain !== domain)),
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
          whitelistEntry: {
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
        message: `Removed domain from whitelist: 
        hasDependents: ${hasDependents}`,
      })

      done()
    },
  },
  /* Update whitelist item */
  {
    type: actions.whitelist.update,
    process({ getState, action }, dispatch, done) {
      const { whitelistObject, logActivity } = action.payload

      const {
        allowAds,
        allowDirectConnect,
        domain,
        includeAllSubdomains,
        allowCookies,
      } = whitelistObject

      const handleUpdate = domain => {
        const { whitelist, proxy } = getState()
        const [oldWhitelist] = whitelist.filter(d => domain === d.domain)
        const updatedWhitelist = { ...whitelistObject, domain }
        const t = updateArrayElement(
          whitelist,
          d => d.domain === domain,
          updatedWhitelist,
        )

        dispatch(actions.whitelist.set(t))

        if (isEqual(updatedWhitelist, oldWhitelist)) {
          return done()
        }

        if (allowAds) {
          updateUboWhitelist({
            ...Object.fromEntries(µBlock.netWhitelist),
            [domain]: [includeAllSubdomains ? `*${domain}/*` : domain],
          })
        } else {
          updateUboWhitelist(
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
          !isEqual(allowDirectConnect, oldWhitelist?.allowDirectConnect)

        const includeAllSubdomainsChanged = !isEqual(
          includeAllSubdomains,
          oldWhitelist?.includeAllSubdomains,
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
          whitelistEntry: whitelistObject,
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
        message: `Updated whitelist entry: 
        includeAllSubdomains: ${!!includeAllSubdomains},
        allowAds: ${!!allowAds},
        allowDirectConnect: ${!!allowDirectConnect},
        allowCookies: ${!!allowCookies}
        hasDependents: ${hasDependents}`,
      })

      done()
    },
  },
  /* Entirely dependent on whitelist [probably not the best place to put it however]
    This just sets the shouldReloadPage value on tab
    */
  {
    type: localActions.setShouldReloadPage,
    latest: true,
    process({ getState, action }, dispatch, done) {
      let shouldIt = true
      const { whitelistEntry } = action.payload
      const { activeTabId, tabs, originalWhitelistInfo } = getState()

      if (originalWhitelistInfo) {
        shouldIt = !isEqual(originalWhitelistInfo, whitelistEntry)
      } else {
        dispatch(actions.originalWhitelistInfo.set(whitelistEntry))
      }

      // the entry must match your current tab url
      // this is because you can 'set' _any_ entry via wl prefs page
      // should also be set to false if you've started to add new entries (to avoid it being there persistently)
      if (
        whitelistEntry &&
        !tabs[activeTabId]?.url.includes(whitelistEntry.domain)
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
