import { store, actions } from 'state'
import setIcon from 'utils/setIcon'

export default {
  lexiconEntries: [
    {
      name: 'online',
      initialState: true,
    },
    {
      name: 'desktopClient',
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
      async process(_, dispatch, done) {
        setIcon()
        done()
      },
    },
  ],
}
