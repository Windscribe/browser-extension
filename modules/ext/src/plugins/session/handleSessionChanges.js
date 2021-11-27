import { ACCOUNT_STATES, ACCOUNT_PLAN } from 'utils/constants'
import { actions, store } from 'state'
import pushToDebugLog from 'utils/debugLogger'

const ACTIVITY = 'session_poller_status_change'

export default ({ oldSession, updatedSession }) => {
  //user being banned
  if (updatedSession.status === ACCOUNT_STATES.BANNED) {
    // logout will show banned screen
    pushToDebugLog({
      activity: ACTIVITY,
      message: `User ${oldSession.username} is banned`,
    })
    store.dispatch(actions.auth.logout({ logActivity: ACTIVITY }))
    return false
  }

  //downgraded
  if (
    oldSession.is_premium === ACCOUNT_PLAN.PREMIUM &&
    updatedSession.is_premium === ACCOUNT_PLAN.FREE
  ) {
    pushToDebugLog({
      activity: ACTIVITY,
      message: `User ${oldSession.username} has been downgraded`,
    })
    // you can still continue as normal
    store.dispatch(actions.view.set('ProPlanExpired'))
    return true
  }

  return true
}
