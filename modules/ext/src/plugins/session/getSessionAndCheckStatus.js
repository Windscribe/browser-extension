import { createAction } from 'redux-actions'
import { isEqual } from 'lodash'
import pickHosts from 'utils/pickHosts'
import createCruiseControlList from 'utils/createCruiseControlList'
import pushToDebugLog from 'utils/debugLogger'
import getBestLocation from 'utils/getBestLocation'
import { getFuzzyCoords } from 'utils/coords'
import { store } from 'state'
import fetchServerList from 'utils/fetchServerList'
import { ACCOUNT_PLAN, ACCOUNT_STATES, SESSION_ERRORS } from 'utils/constants'
import handleSessionChanges from './handleSessionChanges'
import api from 'api'

const ACTIVITY = 'get_session'

const restartProxy = createAction('RESTART_PROXY')

const autoPilot = {
  name: 'cruise_control',
  nickname: '',
  countryCode: 'AUTO',
  hosts: [],
  isDatacenter: false,
}

export const resetToSameLocation = ({
  serverList,
  newLocationData,
  pro,
  groups = null,
}) => {
  const _groups = groups
    ? groups.find(x => x.pro <= pro && x?.hosts?.length > 0)
    : serverList.data
        .find(x => x.id === newLocationData.id)
        .groups.find(x => x.pro <= pro && x?.hosts?.length > 0)

  const hosts = pickHosts(_groups?.hosts)
  if (typeof _groups === 'undefined' || hosts?.length <= 0) {
    return autoPilot
  }

  return {
    name: _groups.city,
    nickname: _groups.nick,
    countryCode: newLocationData.country_code,
    timezone: _groups.tz,
    locationId: newLocationData.id,
    dataCenterId: _groups.id,
    gps: _groups.gps,
    coords: getFuzzyCoords(_groups.gps),
    hosts,
    isDatacenter: true,
    isCenterPro: _groups.pro,
  }
}

export const resetCurrentLocation = ({
  serverList,
  currentLocation,
  exclude,
}) => {
  /* Only need the hosts from this */
  const { hosts } = serverList?.data
    .find(x => x.id === currentLocation.locationId)
    .groups.find(x => x.id === currentLocation.dataCenterId)
  return {
    ...currentLocation,
    hosts: pickHosts(hosts.filter(h => h.hostname !== exclude)),
  }
}

// getLatestSessionInfo() runs during the polling (polling.js, popup.js)

/*
 Some keys might be missing from the new response
 We may still want to check for differences before merging the lists together
 */
const keysToDiff = ['alc']

/* find missing keys in updated object */
const updatedObjMissingKeys = updated => keysToDiff.filter(k => !updated[k])

export default actions => [
  {
    type: actions.session.get,
    latest: true,
    warnTimeout: 0,
    async process({ getState }, dispatch, done) {
      const { session } = getState()
      const apiConfig = api.getConfig()

      pushToDebugLog({
        level: 'INFO',
        activity: ACTIVITY,
        message: `get session: state: ${JSON.stringify(session)}, apiConfig: ${
          apiConfig?.sessionAuthHash
        }`,
      })

      // we have seen the api config have null session auth hash in some cases
      // this should protect fronm that happening when we actually have a hash in the state
      if (session.session_auth_hash && !apiConfig.sessionAuthHash) {
        api.setConfig({
          sessionAuthHash: session.session_auth_hash,
        })
      }

      dispatch(actions.getSessionInFlight.set(true))
      try {
        const sessionData = await api.session.get()
        dispatch(actions.lastSessionRequest.set(Date.now()))
        /* NOTE: api resp has a different shape from state, easier to shallow merge first */
        const missingKeys = updatedObjMissingKeys(session, sessionData)
        const updatedSession = Object.entries({
          ...session,
          ...sessionData,
          ...{ our_ip: sessionData.our_ip ? 1 : 0 },
        }).reduce((obj, [k, v]) => {
          if (missingKeys.includes(k)) {
            return obj
          }

          obj[k] = v
          return obj
        }, {})
        // TODO: fix the missing keys logic above, it seems to miss the ALCs
        if (sessionData.alc?.length > 0) {
          updatedSession.alc = sessionData.alc
        }
        /* To avoid a useless data rewrite */
        if (!isEqual(session, updatedSession)) {
          if (session.username === null && updatedSession.username !== null) {
            //ghost account claimed. ask for email if not provided
            if (!updatedSession.email) {
              if (updatedSession.is_premium || updatedSession.alc?.length > 0) {
                dispatch(actions.view.set('GhostAddEmail'))
              } else {
                dispatch(actions.view.set('GhostAddEmailPro'))
              }
            }
          }
          dispatch(actions.session.set(updatedSession))

          // getSessionInFlight will be called at the end of checkstatus
          dispatch(
            actions.session.checkstatus({
              updated: sessionData,
              old: session,
              logActivity: ACTIVITY,
            }),
          )
        } else dispatch(actions.getSessionInFlight.set(false))
        //reset proxy error state
        dispatch(actions.proxyError.set(false))
        dispatch(actions.recoveryStateIndex.set(0))
      } catch (err) {
        console.error(err)
        pushToDebugLog({
          level: 'ERROR',
          activity: ACTIVITY,
          message: `get latest session info failed: ${err.message}`,
        })
        // if session if invalid, logout
        // 501 & 502 are validation errors
        if (
          err.code === SESSION_ERRORS.SESSION_INVALID ||
          err.code === SESSION_ERRORS.NO_AUTH_HASH ||
          err.code === 501 ||
          err.code === 502
        ) {
          // this error will appear when you reach login page
          dispatch(
            actions.session.assign({
              error: { data: { errorCode: err.code } },
            }),
          )
          store.dispatch(actions.auth.logout({ logActivity: ACTIVITY }))
        }
      }
      done()
    },
  },
  {
    type: restartProxy,
    latest: true,
    async process({ getState, action }, dispatch, done) {
      const { proxy, currentLocation, session } = getState()
      const {
        locationOverride,
        serverList,
        logActivity = null,
      } = action.payload

      const CUSTOM_ACTIVITY = logActivity || ACTIVITY
      let silent = false

      if (locationOverride) {
        // If restarting proxy with autoPilot, use silent mode to prevent notification and UI connecting state
        if (
          locationOverride.name === 'cruise_control' &&
          currentLocation.name === 'cruise_control'
        ) {
          silent = true
        }
        dispatch(actions.currentLocation.set(locationOverride))
      }

      await getBestLocation({
        serverList,
        dispatch,
        premium: session.is_premium,
        activity: ACTIVITY,
      })

      if (proxy.status === 'disconnected') {
        return done()
      }

      dispatch(
        actions.proxy.activate({
          logActivity: `${CUSTOM_ACTIVITY}_restart_proxy`,
          silent,
        }),
      )

      done()
    },
  },
  {
    type: actions.session.checkstatus,
    warnTimeout: 0,
    async process({ getState, action }, dispatch, done) {
      const { old: oldSession, updated: updatedSession, logActivity } =
        action?.payload || {}
      const { currentLocation, expiredUsername } = getState()
      // if the user was expired before but has an active status now
      // clear the expiredUsername state
      if (
        updatedSession.username === expiredUsername &&
        updatedSession.status === ACCOUNT_STATES.ACTIVE
      ) {
        dispatch(actions.expiredUsername.set(null))
        pushToDebugLog({
          activity: logActivity,
          message: `Expired user ${expiredUsername} is now active, unsetting expired lockout`,
        })
      }

      const handleStatusChange = async ({
        serverList,
        premiumStatusChanged,
        revisionHashChanged,
      }) => {
        // set view/behaviour based on status
        const canContinueSession = handleSessionChanges({
          oldSession,
          updatedSession,
        })

        if (!canContinueSession) {
          return
        }
        /* We don't need to verify current dc access if connected to cruise control,
         if server rev or pro status changed, restart autopilot so that it has latest hosts */
        const isLocationAutoPilot =
          getState().currentLocation.name === 'cruise_control'
        if (isLocationAutoPilot) {
          if (revisionHashChanged || premiumStatusChanged) {
            return store.dispatch(
              restartProxy({ locationOverride: autoPilot, serverList }),
            )
          }
          return
        }

        // to ensure we gracefully handle currently connected locations
        const newLocationData = serverList.data.find(
          x => x.id === currentLocation.locationId,
        )

        const cannotAccessLocation =
          newLocationData?.premium_only &&
          updatedSession.is_premium === ACCOUNT_PLAN.FREE

        if (cannotAccessLocation || typeof newLocationData === 'undefined') {
          pushToDebugLog({
            activity: logActivity,
            message: 'Cannot access location, or location does not exist',
          })
          return store.dispatch(
            restartProxy({ locationOverride: autoPilot, serverList }),
          )
        }

        // if location is free, there is yet a chance a user is connected to premium dataCenter within,
        // or this DC is not in the new list
        const dataCenterInNewServerList = newLocationData?.groups.find(
          x => x.id === currentLocation.dataCenterId,
        )

        const currentLocationHosts = currentLocation.hosts
        const newDcHosts = dataCenterInNewServerList.hosts?.map(h => h.hostname)

        if (
          dataCenterInNewServerList?.pro &&
          updatedSession.is_premium === ACCOUNT_PLAN.FREE
        ) {
          pushToDebugLog({
            activity: logActivity,
            message: 'Data center is pro but current user is free',
          })
          return store.dispatch(
            restartProxy({ locationOverride: autoPilot, serverList }),
          )
        } else if (
          typeof dataCenterInNewServerList === 'undefined' ||
          typeof dataCenterInNewServerList.hosts === 'undefined' ||
          dataCenterInNewServerList.hosts.length === 0
        ) {
          pushToDebugLog({
            activity: logActivity,
            message:
              'No data center or usable hosts to choose, reset to dc within same location',
          })
          store.dispatch(
            restartProxy({
              locationOverride: resetToSameLocation({
                serverList,
                newLocationData,
                pro: updatedSession.is_premium,
              }),
              serverList,
            }),
          )
        } else if (currentLocationHosts.some(h => !newDcHosts.includes(h))) {
          // hosts could be different as well, either a host went down or new one added, we only care if new list is completely new, w/o old hosts
          pushToDebugLog({
            activity: logActivity,
            message: `Hostnames changed from ${currentLocationHosts} to ${newDcHosts}, resetting dc with new hosts`,
          })
          store.dispatch(
            restartProxy({
              locationOverride: resetCurrentLocation({
                serverList,
                currentLocation,
              }),
              serverList,
            }),
          )
        } else if (premiumStatusChanged) {
          pushToDebugLog({
            activity: logActivity,
            message: 'User premium status changed, restarting proxy',
          })
        }
      }

      const getServerList = async () => {
        dispatch(actions.serverList.fetch())
        try {
          const serverList = await fetchServerList(updatedSession)
          dispatch(actions.serverList.fetchSuccess(serverList))

          return serverList
        } catch (err) {
          const erMsg = 'Check session status failed'
          console.error(erMsg, err)
          pushToDebugLog({
            activity: logActivity,
            message: `${erMsg}: ${err}`,
          })
          dispatch(actions.serverList.fetchFailure(err))
        }
      }

      // user ran out of data
      if (updatedSession.status === ACCOUNT_STATES.EXPIRED) {
        // you expired and are put on the naughty list to prevent multiple accounts
        pushToDebugLog({
          activity: logActivity,
          message: `User ${updatedSession.username} is expired`,
        })
        dispatch(actions.expiredUsername.set(updatedSession.username))
        dispatch(actions.view.set('NoData'))
        dispatch(actions.proxy.deactivate({ logActivity: ACTIVITY }))
      } else {
        /* Handles runtime user account changes, note that connect to cruise control is done to prevent user disruption */

        const statusMap = [
          'is_premium',
          'status',
          'alc',
          'loc_hash',
          'billing_plan_id',
        ]

        // log relevant status changes
        const statusChangeString = statusMap.reduce((acc, curr) => {
          const oldStatusItem = oldSession[curr]
          const newStatusItem = updatedSession[curr]
          if (!isEqual(oldStatusItem, newStatusItem)) {
            acc += `${curr}: from ${JSON.stringify(
              oldStatusItem,
            )} to ${JSON.stringify(newStatusItem)} \n`
          }
          return acc
        }, '')

        if (statusChangeString.length > 0) {
          pushToDebugLog({
            activity: logActivity,
            message: `User ${updatedSession.username} session changed: \n ${statusChangeString}`,
          })
        }

        const statusChanges = statusMap.map(
          x => !isEqual(oldSession[x], updatedSession[x]),
        )

        const [
          premiumStatusChanged,
          accountStatusChanged,
          alcListChanged,
          revisionHashChanged,
          billingPlanIdChanged,
        ] = statusChanges

        if (billingPlanIdChanged) {
          dispatch(
            actions.newsfeedItems.fetch({
              logActivity: ACTIVITY,
              checkPopup: true,
            }),
          )
        }

        dispatch(actions.showRateUs.set(true))

        if (
          alcListChanged ||
          revisionHashChanged ||
          premiumStatusChanged ||
          accountStatusChanged ||
          oldSession === undefined
        ) {
          let serverList
          if (updatedSession.status !== ACCOUNT_STATES.BANNED) {
            if (getState().view.current === 'Banned') {
              pushToDebugLog({
                activity: logActivity,
                message: `Banned user ${updatedSession.username} has been unbanned, removing modal lockout`,
              })
              store.dispatch(actions.view.set('Main'))
            }

            //Avoid pointless api call
            serverList = await getServerList()

            if (premiumStatusChanged || revisionHashChanged) {
              // regen cruiseControl list only if your premium status changed
              const cruiseControlDomains = getState().cruiseControlDomains.data
                .domains

              const ccList = createCruiseControlList({
                serverlist: serverList.data,
                userPremiumStatus: updatedSession.is_premium,
                cruiseControlDomains,
              })

              dispatch(
                actions.cruiseControlList.assign({
                  data: ccList,
                }),
              )

              const debugCcList = ccList.map(location => {
                const allDcs = location.groups.map(dc => {
                  return [dc.city + ' ' + dc.nick, dc.pro]
                })
                return {
                  [location.name]: allDcs,
                }
              })

              if (premiumStatusChanged) {
                pushToDebugLog({
                  activity: logActivity,
                  message: `Premium Status changed, new cc list: ${JSON.stringify(
                    debugCcList,
                  )}`,
                })
              } else if (revisionHashChanged) {
                pushToDebugLog({
                  activity: logActivity,
                  message: 'Revision Hash changed',
                })
              }
            }
          }
          handleStatusChange({
            serverList,
            alcListChanged,
            revisionHashChanged,
            accountStatusChanged,
            premiumStatusChanged,
          })
        }
      }
      dispatch(actions.getSessionInFlight.set(false))
      done()
    },
  },
]
