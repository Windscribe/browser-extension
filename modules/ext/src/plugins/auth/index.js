import { store, actions } from 'state'
import pushToDebugLog from 'utils/debugLogger'
import login from './login'
import logout from './logout'
import server from './server'
import onWebRequestAuthRequired from './onAuthRequired'

export default {
  lexiconEntries: [
    {
      name: 'auth',
    },
    {
      name: 'loggingIn',
      initialState: false,
    },
    {
      name: 'expiredUsername',
      initialState: null,
    },
    {
      name: 'userStashes',
      initialState: {},
    },
    {
      name: 'ghost',
    },
    {
      name: 'lastAuthErrorReset',
      initialState: {
        timestamp: '',
        errorCount: 0,
      },
    },
  ],
  initialize() {
    global.serverCredentials = {
      username: store.getState()?.serverCredentials?.username || '',
      password: store.getState()?.serverCredentials?.password || '',
    }

    pushToDebugLog({
      activity: 'auth_plugin_initialize',
      message: `global.serverCredentials is ${JSON.stringify(
        global.serverCredentials.username,
        null,
        2,
      )}`,
    })
  },
  onWebRequestAuthRequired,
  onMessage: {
    autologin(message) {
      store.dispatch(actions.auth.autologin(message.payload))
    },
    loginswap(message) {
      const username = store.getState()?.session.username
      if (username === null) {
        store.dispatch(actions.auth.autologin(message.payload))
      }
    },
  },
  logic: actions => {
    return [...login(actions), logout(actions), ...server(actions)]
  },
}
