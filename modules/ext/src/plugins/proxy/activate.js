import { flatten } from 'lodash'
import pushToDebugLog from 'utils/debugLogger'
import checkIp from 'utils/public-ip'
import { IS_CHROME, AUTH_RESET_MIN_INTERVAL } from 'utils/constants'
import transformWhitelist from 'plugins/whitelist/transform'
import proxyOnIcon from 'assets/proxyIcons/proxy_on.png'
import setPac from './pac'
import setIcon from 'utils/setIcon'
import getBestLocation from 'utils/getBestLocation'
import {
  resetCurrentLocation,
  resetToSameLocation,
} from '../../plugins/session/getSessionAndCheckStatus'
import checkInternet from 'utils/check-internet'
import sleep from 'shleep'

const fetchTimeout = (ms, promise) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('fetch timeout'))
    }, ms)
    promise.then(
      res => {
        clearTimeout(timeoutId)
        resolve(res)
      },
      err => {
        clearTimeout(timeoutId)
        reject(err)
      },
    )
  })
}

const RECOVERY_STATES = [
  'retry_diff_host',
  'retry_diff_dc',
  'retry_with_autopilot_and_new_best_location',
]

const createWhitelist = whitelist => flatten(transformWhitelist(whitelist))

const autoPilot = {
  name: 'cruise_control',
  nickname: '',
  countryCode: 'AUTO',
  hosts: [],
  isDatacenter: false,
}

export const getHostnames = ({
  bestLocation,
  _currentLocation,
  isCruiseControl,
  logActivity,
}) => {
  let hostnames = null
  if (isCruiseControl && bestLocation.hosts) {
    hostnames = bestLocation.hosts
  } else {
    hostnames = _currentLocation.hosts
  }
  pushToDebugLog({
    activity: logActivity,
    message: `Hostname(s) set to: ${hostnames}`,
  })
  return hostnames
}

export default actions => ({
  type: actions.proxy.activate,
  cancelType: actions.proxy.deactivate,
  latest: true,
  async process({ getState, action }, dispatch, done) {
    const { logActivity, recoveryMode = RECOVERY_STATES[0] } =
      action?.payload || {}
    const SUSPECTED_AUTH_ERROR_LOOP = 'Suspected auth error loop'
    pushToDebugLog({
      activity: logActivity,
      message: 'Activating proxy...',
    })

    const { username } = getState().serverCredentials
    pushToDebugLog({
      activity: logActivity,
      message: `using credentials: username ${username}`,
    })

    const {
      currentLocation,
      cruiseControlList,
      whitelist,
      session,
      serverList,
      online,
      recoveryStateIndex,
    } = getState()

    pushToDebugLog({
      activity: logActivity,
      message: `proxy location: ${currentLocation.name} hosts: ${JSON.stringify(
        currentLocation.hosts,
      )} recoverState: ${recoveryStateIndex}`,
    })

    if (!online) {
      pushToDebugLog({
        activity: logActivity,
        message: `no internet connection, aborting`,
      })
      done()
      return
    }

    let _currentLocation = { ...currentLocation }

    const { silent } = action.payload || {}
    // Handle the case where there are no hosts in the location, this shouldnt happen, but shit happens
    if (
      _currentLocation.name !== 'cruise_control' &&
      _currentLocation.hosts.length === 0
    ) {
      pushToDebugLog({
        activity: logActivity,
        message:
          'No hosts in location, setting current location to cruise control',
      })
      _currentLocation = autoPilot

      dispatch(actions.currentLocation.set(_currentLocation))
    }

    const isCruiseControl = _currentLocation.name === 'cruise_control'

    const reApplyPublicIp = async () => {
      try {
        const publicIp = await fetchTimeout(5000, checkIp())
        if (publicIp.length === 0) {
          throw new Error('Empty IP address from checkIP request')
        }
        dispatch(actions.proxy.assign({ publicIp }))
        pushToDebugLog({
          activity: logActivity,
          message: 'Successfully reapplied public IP',
        })
        return true
      } catch (e) {
        pushToDebugLog({
          activity: logActivity,
          level: 'ERROR',
          message: `Error while reapplying public IP: ${JSON.stringify(e)}`,
        })
        return false
      }
    }

    const noSSLScribe = async retry => {
      try {
        const resp = await fetchTimeout(5000, fetch('http://nosslscribe.com'))
        if (!resp.ok) {
          throw Error(resp.statusText)
        }
        dispatch(actions.proxyError.set(false))
        pushToDebugLog({
          activity: logActivity,
          message: 'Successfully checked creds against nosslscribe.com',
        })
        return true
      } catch (e) {
        if (retry <= 3) {
          pushToDebugLog({
            activity: logActivity,
            level: 'ERROR',
            message: `Error while checking creds against nosslscribe.com: ${JSON.stringify(
              e,
            )} Retrying in 1s`,
          })
          await sleep(1000)
          const nextRetry = retry + 1
          return await noSSLScribe(nextRetry)
        } else {
          pushToDebugLog({
            activity: logActivity,
            level: 'ERROR',
            message: `Error while checking creds against nosslscribe.com: ${JSON.stringify(
              e,
            )}`,
          })
          return false
        }
      }
    }

    const sslCheckAndConnect = async () => {
      const setSSL = await noSSLScribe(1)
      const setPublicIp = await reApplyPublicIp()

      if (!setSSL && !setPublicIp) {
        //both calls failed, something is awry, show caution view
        throw new Error('No connectivity after proxy activate')
      } else {
        // if no errors, that *should* mean that creds are good

        // check last time successful auth happened
        const { lastAuthErrorReset } = getState()
        if (
          Date.now() - lastAuthErrorReset.timestamp <
          AUTH_RESET_MIN_INTERVAL
        ) {
          pushToDebugLog({
            activity: logActivity,
            message: `Aborting connection. Last auth reset less than ${AUTH_RESET_MIN_INTERVAL}ms ago. : ${JSON.stringify(
              lastAuthErrorReset,
            )}`,
          })
          throw new Error(SUSPECTED_AUTH_ERROR_LOOP)
        }
        // store errorCount with timestamp
        const authErrorReset = {
          timestamp: Date.now(),
          errorCount: global.authErrorCount,
        }
        pushToDebugLog({
          activity: logActivity,
          message: ` New auth error reset : ${JSON.stringify(authErrorReset)}`,
        })
        dispatch(actions.lastAuthErrorReset.set(authErrorReset))
        global.authErrorCount = 0
        dispatch(actions.proxy.assign({ status: 'connected' }))
        dispatch(actions.proxyDiscovered.set(true))
      }
      await reApplyPublicIp()
    }

    const onProxySetupComplete = async () => {
      const locationInfo = `${
        isCruiseControl ? 'AutoPilot' : _currentLocation.name
      } ${_currentLocation.nickname}`

      // If silent mode, do not show notification and show connected status right away
      if (silent) {
        await sslCheckAndConnect()

        pushToDebugLog({
          activity: logActivity,
          message: `Proxy has been silently activated: ${locationInfo}`,
        })
        dispatch(actions.recoveryStateIndex.set(0))
        done()
        return
      } else {
        dispatch(actions.proxy.assign({ status: 'connecting' }))
      }

      setIcon({ path: `${proxyOnIcon}` })

      await sslCheckAndConnect()

      setIcon()

      dispatch(
        actions.systemNotification.set(
          // TODO: i18n
          {
            icon: proxyOnIcon,
            message: `You are now connected to Windscribe (${locationInfo})`,
          },
        ),
      )
      pushToDebugLog({
        activity: logActivity,
        message: `Proxy has been activated: ${locationInfo}`,
      })
      dispatch(actions.recoveryStateIndex.set(0))
      done()
    }

    try {
      if (IS_CHROME) {
        //check if controlled by another extension
        await setPac({
          cruiseControlList: isCruiseControl && cruiseControlList.data,
          hostnames: getHostnames({
            bestLocation: getState().bestLocation,
            _currentLocation,
            isCruiseControl,
            logActivity,
          }),
          whitelist: createWhitelist(whitelist),
        })
        const proxySettingAfter = await new Promise(resolve => {
          browser.proxy.settings.get({}, function (details) {
            resolve(details.levelOfControl)
          })
        })
        if (proxySettingAfter !== 'controlled_by_this_extension') {
          //get list of other extensions for debugging
          const extensionInfo = await browser.management.getAll()
          pushToDebugLog({
            activity: logActivity,
            level: 'ERROR',
            message: `proxy activate done with settings state: ${proxySettingAfter}.. extensions info: ${JSON.stringify(
              extensionInfo,
            )}`,
          })
          // show proxy control view
          dispatch(actions.proxy.assign({ status: 'disconnected' }))
          dispatch(actions.view.set('OtherExtension'))
          done()
          return
        }
        await onProxySetupComplete()
        pushToDebugLog({
          activity: logActivity,
          message: 'Pac successfully set',
        })
      } else {
        await onProxySetupComplete()
      }
    } catch (error) {
      pushToDebugLog({
        activity: logActivity,
        level: 'ERROR',
        message: `Pac failed to set: ${error.toString()}`,
      })
      let haveInternet
      try {
        //check if we have internet
        const hostIP = await fetchTimeout(5000, checkInternet())
        haveInternet = hostIP.length === 0 ? false : true
      } catch (e) {
        haveInternet = false
      }
      pushToDebugLog({
        activity: logActivity,
        level: 'INFO',
        message: `proxy activate has internet: ${haveInternet}`,
      })

      // attempt to connect using different strategies
      if (
        haveInternet &&
        !isCruiseControl &&
        recoveryStateIndex < RECOVERY_STATES.length &&
        error.message !== SUSPECTED_AUTH_ERROR_LOOP
      ) {
        switch (recoveryMode) {
          case RECOVERY_STATES[0]:
            let exclude = null
            if (currentLocation.hosts.length > 1) {
              exclude = currentLocation.hosts.shift()
            }
            pushToDebugLog({
              activity: logActivity,
              level: 'INFO',
              message: `proxy recovery ${recoveryStateIndex} - resetCurrentLocation: ${JSON.stringify(
                currentLocation.hosts,
              )} exclude = ${exclude}`,
            })
            dispatch(
              actions.currentLocation.set(
                resetCurrentLocation({
                  serverList,
                  currentLocation,
                  exclude,
                }),
              ),
            )
            break
          case RECOVERY_STATES[1]:
            if (getState().failover === 'Auto / Best') {
              await getBestLocation({
                serverList,
                dispatch,
                premium: session.is_premium,
                activity: recoveryMode,
              })
              pushToDebugLog({
                activity: logActivity,
                level: 'INFO',
                message: `proxy recovery ${recoveryStateIndex} - reset to AutoPilot`,
              })
              dispatch(actions.currentLocation.set(autoPilot))
            }
            break
          case RECOVERY_STATES[2]:
            if (
              getState().failover !== 'None' &&
              getState().failover !== 'None'
            ) {
              const currentLocationData = serverList.data.find(
                x => x.id === currentLocation.locationId,
              )
              const newLocationData = Object.entries(
                currentLocationData,
              ).reduce((acc, [key, value]) => {
                if (key === 'groups') {
                  acc[key] = value.filter(
                    i => i.id !== currentLocation.dataCenterId,
                  )
                } else {
                  acc[key] = value
                }
                return acc
              }, {})
              pushToDebugLog({
                activity: logActivity,
                level: 'INFO',
                message: `proxy recovery ${recoveryStateIndex} - resetToSameLocation: ${JSON.stringify(
                  newLocationData,
                )}`,
              })
              dispatch(
                actions.currentLocation.set(
                  resetToSameLocation({
                    serverList,
                    newLocationData,
                    groups: newLocationData.groups,
                    pro: session.is_premium,
                  }),
                ),
              )
            }
            break
          default:
            break
        }
        dispatch(actions.recoveryStateIndex.set(recoveryStateIndex + 1))
        dispatch(
          actions.proxy.activate({
            silent: true,
            logActivity: recoveryMode,
            recoveryMode: RECOVERY_STATES[recoveryStateIndex + 1],
          }),
        )
        done()
        return
      }

      dispatch(actions.recoveryStateIndex.set(0))
      if (IS_CHROME) {
        //check if controlled by another extension
        const proxySetting = await new Promise(resolve => {
          browser.proxy.settings.get({}, function (details) {
            resolve(details.levelOfControl)
          })
        })
        pushToDebugLog({
          activity: logActivity,
          level: 'INFO',
          message: `proxy activate error with settings state: ${proxySetting}`,
        })
        if (proxySetting === 'controlled_by_other_extensions') {
          // show proxy control view
          dispatch(actions.proxy.deactivate())
          dispatch(actions.proxy.assign({ status: 'disconnected' }))
          dispatch(actions.view.set('OtherExtension'))
          done()
          return
        } else {
          if (haveInternet) {
            dispatch(actions.view.set('SomethingWeird'))
          }
        }
      }

      if (getState().smokewall) {
        pushToDebugLog({
          activity: logActivity,
          level: 'INFO',
          message: `Smokewall is true.`,
        })
        dispatch(actions.proxy.assign({ status: 'error' }))
      } else {
        pushToDebugLog({
          activity: logActivity,
          level: 'INFO',
          message: `Smokewall is false. Disconnecting proxy.`,
        })
        dispatch(actions.proxy.deactivate())
        dispatch(actions.proxy.assign({ status: 'disconnected' }))
      }
      done()
    }
  },
})
