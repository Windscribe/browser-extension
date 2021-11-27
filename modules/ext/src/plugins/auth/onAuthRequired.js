import { store, actions } from 'state'
import debugLog from 'utils/debugLogger'
import { AUTH_ERROR_COUNT_MAX, IS_CHROME } from 'utils/constants'
import { shuffle } from 'lodash'

const LOG_ACTIVITY = 'auth_required'

global.authErrorCount = 0

export default (details, cb) => {
  if (details.realm !== 'Windscribe-Proxy') {
    // only handle auth challenges from the WS proxy
    return IS_CHROME ? cb(null) : null
  }

  if (global.authErrorCount >= AUTH_ERROR_COUNT_MAX) {
    // TODO: show view with link to submit debug log
    const { smokewall } = store.getState()
    if (smokewall) {
      debugLog({
        activity: LOG_ACTIVITY,
        message: `Smokewall is true.`,
      })
      store.dispatch(actions.proxy.assign({ status: 'error' }))
    } else {
      store.dispatch(actions.proxy.deactivate({ logActivity: LOG_ACTIVITY }))
    }
    debugLog({
      activity: LOG_ACTIVITY,
      message: `Auth count exceeded AUTH_ERROR_COUNT_MAX of ${AUTH_ERROR_COUNT_MAX}. Smokewall is ${smokewall}`,
    })

    global.authErrorCount = 0

    const res = { cancel: true }
    return IS_CHROME ? cb(res) : Promise.resolve(res)
  } else if (global.authErrorCount === 5) {
    //trigger reconnect so that the failovers can fix any node issues
    debugLog({
      activity: LOG_ACTIVITY,
      message: 'authErrorCount is 5, trying to reconnect to same location',
    })
    const { currentLocation, online } = store.getState()
    currentLocation.hosts = shuffle(currentLocation.hosts)
    store.dispatch(actions.currentLocation.set(currentLocation))
    if (online) {
      store.dispatch(
        actions.proxy.activate({
          silent: true,
          logActivity: 'auth_error_reconnect',
        }),
      )
    }
  } else if (global.authErrorCount === 4) {
    // Make sure the account is not banned etc
    debugLog({
      activity: LOG_ACTIVITY,
      message: 'authErrorCount is 4, trying to check session',
    })

    if (!store.getState()?.getSessionInFlight) {
      store.dispatch(actions.session.get())
    }
  } else if (global.authErrorCount === 2 || global.authErrorCount === 3) {
    debugLog({
      activity: LOG_ACTIVITY,
      message: `authErrorCount is ${global.authErrorCount}, trying to get new creds`,
    })
    store.dispatch(actions.auth.getservercreds({ logActivity: LOG_ACTIVITY }))
  }

  global.authErrorCount += 1

  const creds = {
    authCredentials: global.serverCredentials,
  }

  debugLog({
    activity: LOG_ACTIVITY,
    message: `returning creds: ${JSON.stringify({
      authErrorCount: global.authErrorCount,
      ...creds,
    })}`,
  })

  if (IS_CHROME) {
    cb(creds)
  } else {
    return creds
  }
}
