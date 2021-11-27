import { IS_FIREFOX, ACCOUNT_STATES, PROXY_PORT } from 'utils/constants'
import { store, actions } from 'state'
import checkIp from 'utils/public-ip'
import getBestLocation from 'utils/getBestLocation'
import activate from './activate'
import deactivate from './deactivate'
import proxyOnRequest from './onProxyRequest'
import bestLocation from './bestLocation'
import setLocation from './setLocation'

const activateProxy = ({ session, autoConnect, proxyDiscovered, ACTIVITY }) => {
  // session auth hash existing means you're logged in
  const shouldAutoConnect =
    session.session_auth_hash &&
    autoConnect &&
    proxyDiscovered &&
    session.status === ACCOUNT_STATES.ACTIVE

  if (shouldAutoConnect) {
    store.dispatch(actions.proxy.activate({ logActivity: ACTIVITY }))
  } else {
    if (!autoConnect) {
      store.dispatch(
        actions.proxy.deactivate({
          logActivity: 'proxy_init',
          notification: false,
        }),
      )
    }
    checkIp().then(publicIp =>
      store.dispatch(actions.proxy.assign({ publicIp })),
    )
  }
}

export default {
  lexiconEntries: [
    {
      name: 'currentLocation',
      stashOnLogout: true,
      initialState: {
        name: 'cruise_control',
        nickname: '',
        countryCode: 'AUTO',
        hosts: [],
        isDatacenter: false,
      },
    },
    {
      name: 'bestLocation',
    },
    {
      name: 'proxyError',
      initialState: false,
    },
    {
      name: 'recoveryStateIndex',
      initialState: 0,
    },
    {
      name: 'autoConnect',
      initialState: true,
      stashOnLogout: true,
    },
    {
      name: 'proxy',
      initialState: {
        publicIp: '',
        status: 'disconnected',
      },
    },
    {
      name: 'proxyPort',
      initialState: PROXY_PORT,
    },
    {
      name: 'proxyDiscovered',
      initialState: false,
    },
    {
      name: 'smokewall',
      initialState: true,
    },
  ],
  onWindowCreated() {
    // removed Jan 15th 2019
    // Not sure why this was here, the new window will have the same proxy settings as the original,
    // so no need to change proxy state
    // const { session, autoConnect, proxyDiscovered, proxy } = store.getState()
    // if (proxy.status === 'disconnected') {
    //   activateProxy({
    //     session,
    //     autoConnect,
    //     proxyDiscovered,
    //     ACTIVITY: 'on_window_created',
    //   })
    // }
  },
  async initialize() {
    const ACTIVITY = 'proxy_init'

    const {
      session,
      autoConnect,
      proxyDiscovered,
      serverList,
      loggingIn,
    } = store.getState()

    if (IS_FIREFOX) {
      store.dispatch(actions.proxy.setuponrequest())
    }

    if (session.session_auth_hash && serverList && !loggingIn) {
      await getBestLocation({
        serverList,
        dispatch: store.dispatch,
        premium: session.is_premium,
        activity: ACTIVITY,
      })
      store.dispatch(actions.session.get())
    }

    activateProxy({ session, autoConnect, proxyDiscovered, ACTIVITY })
  },
  onProxyError(message) {
    const { proxyError, proxy, recoveryStateIndex } = store.getState()
    if (proxyError === false && proxy.status === 'connected') {
      store.dispatch(actions.proxyError.set(true))
      store.dispatch(
        actions.auth.getservercreds({ logActivity: 'proxy_error' }),
      )
      if (recoveryStateIndex === 0) {
        //restart proxy to trigger fallback flow if host is down
        setTimeout(() => {
          store.dispatch(
            actions.proxy.activate({
              logActivity: `proxy_error_restart`,
              silent: true,
            }),
          )
        }, 2500)
      }
    }
    console.error('Proxy error', message)
  },
  logic: actions => [
    activate(actions),
    deactivate(actions),
    proxyOnRequest(actions),
    bestLocation(actions),
    setLocation(actions),
  ],
}
