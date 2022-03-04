import { store, actions } from 'state'
import setNotificationBlocker from 'utils/setNotificationBlocker.js'

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let permissionGranted = false
let permissionPollingStarted = false
const POLL_INTERVAL = 1000
const MAX_POLL_TICK = 60

export default {
  lexiconEntries: [
    {
      name: 'notificationBlockerEnabled',
      initialState: false,
      stashOnLogout: true,
    },
    {
      name: 'permDialogOpen',
      initialState: false,
    },
  ],
  onPermissionAdded: ({ permissions }) => {
    if (permissions.includes('contentSettings')) {
      const { privacyOptionsCount } = store.getState()
      store.dispatch(actions.privacyOptionsCount.set(privacyOptionsCount + 1))
      store.dispatch(
        actions.notificationBlockerEnabled.setandlog({
          value: true,
          logActivity: `Notification blocker setting turned on via permission accept: ${permissions}`,
        }),
      )
    }
  },
  onMessage: {
    'instantiate-permission-listener-ff': async (_, { resolve }) => {
      const setPermDialogOpen = permOpen =>
        store.dispatch(actions.permDialogOpen.set(permOpen))

      console.error('3. instantiate permissions listener')
      if (permissionPollingStarted) {
        console.error('perm polling already started')
        return
      }
      let tickCount = 0
      do {
        console.error('tick count', tickCount)
        if (permissionGranted) {
          console.error('permission granted')
          setPermDialogOpen(false)
          return
        }
        if (!permissionPollingStarted) {
          console.error('perm polling not started, start it now')
          permissionPollingStarted = true
        }
        let hasPerm
        try {
          console.error(
            'checking browser perms, if they contain "browserSettings"',
          )
          hasPerm = await browser.permissions.contains({
            permissions: ['browserSettings'],
          })
          console.error('has perm is', hasPerm)
        } catch (e) {
          console.error(JSON.stringify(e))
          return
        }
        if (hasPerm) {
          console.error('browser has perm')
          permissionGranted = true
          store.dispatch(
            actions.notificationBlockerEnabled.setandlog({
              value: true,
              logActivity: `Notification blocker setting turned on via permission accept`,
            }),
          )
        }
        await timeout(POLL_INTERVAL)
        tickCount += 1
      } while (tickCount < MAX_POLL_TICK)
      setPermDialogOpen(false)
      console.error('polling ended, reset tick count, nothin to see here 👮🏻‍♀️')
      permissionPollingStarted = false
      tickCount = 0
      return resolve(true)
    },
  },
  logic: actions => [
    {
      type: [
        actions.notificationBlockerEnabled.setandlog,
        actions.notificationBlockerEnabled.set,
      ],
      latest: true,
      async process({ action }, dispatch, done) {
        let isEnabled = action.payload?.value
        // override is for when user turned on feature but did not accept permission
        // we take no action and just apply payload value
        const override = action.payload?.override

        if (isEnabled === undefined) {
          isEnabled = action.payload
        }
        if (!override) {
          await setNotificationBlocker(isEnabled)
        }
        done()
      },
    },

    {
      type: actions.auth.logout,
      latest: true,
      async process(_, dispatch, done) {
        await setNotificationBlocker(false)
        done()
      },
    },
  ],
}
