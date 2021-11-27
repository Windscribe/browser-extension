import checkIp from 'utils/public-ip'
import { store, actions } from 'state'
import setIcon from 'utils/setIcon'

let prev_our_ip = null

export default {
  lexiconEntries: [
    {
      name: 'online',
      initialState: true,
    },
    {
      name: 'desktopClient',
      initialState: {
        installed: false,
        isConnected: false,
      },
    },
  ],
  initialize() {
    store.dispatch(actions.online.set(navigator.onLine))
  },
  onOffline() {
    store.dispatch(actions.online.set(false))
    setIcon()
  },
  onOnline() {
    store.dispatch(actions.online.set(true))
    setIcon()
  },
  logic: actions => [
    {
      type: actions.desktopClient.fetch,
      latest: true,
      async process({ getState }, dispatch, done) {
        const { our_ip = false } = getState()?.session

        if (prev_our_ip !== null && prev_our_ip === 1 && our_ip === 0) {
          checkIp().then(publicIp =>
            store.dispatch(actions.proxy.assign({ publicIp })),
          )
          prev_our_ip = null
        }

        /* This will always throw an error.  Err 400 means the desktop app is installed */
        try {
          const desktopConnection = await fetch(
            'https://wsappcontrol.com:13337/',
          )
          const installed = desktopConnection.status === 400
          dispatch(
            actions.desktopClient.fetchSuccess({
              installed,
              isConnected: installed && !!our_ip,
            }),
          )
          prev_our_ip = our_ip
        } catch {
          dispatch(
            actions.desktopClient.fetchFailure({
              installed: false,
              isConnected: false,
            }),
          )
        }

        setIcon()
        done()
      },
    },
  ],
}
