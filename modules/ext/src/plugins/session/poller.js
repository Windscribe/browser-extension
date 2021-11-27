import globals from 'utils/globals'
import pollerLogger from 'utils/debugLogger'

export let pollerInterval

export default actions => ({
  type: actions.sessionPoller.activate,
  cancelType: [
    actions.sessionPoller.activate,
    actions.sessionPoller.deactivate,
  ],
  warnTimeout: 0,
  async process({ action, getState, cancelled$ }, dispatch, done) {
    const { logActivity, interval = globals.SESSION_POLLER_INTERVAL } =
      action?.payload || {}
    pollerLogger({
      activity: logActivity,
      message: 'Activating session poller',
    })

    pollerInterval = setInterval(() => {
      //
      const { proxy, session } = getState()
      if (proxy.status === 'connected' && session?.session_auth_hash) {
        // poll only when connected and we have a session_auth_hash
        dispatch(actions.session.get())
      }
    }, await interval)

    cancelled$.subscribe(() => {
      pollerLogger({
        activity: logActivity,
        message: 'Deactivating session poller',
      })
      clearInterval(pollerInterval)
      return done()
    })
  },
})
