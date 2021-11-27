import { store, actions } from 'state'
import { SYNC_KEY } from 'utils/constants'
import { getDb } from 'utils/db'
import pushToDebugLog from './debugLogger'

/**
 * @param {Function}  - for debug logging
 */
export default async ({ logActivity }) => {
  const db = getDb()
  // TODO: listen to uninstall event to clear storage
  // TODO: this might need to happen earlier in the init lifecycle
  const storedData = await db.WS_STATE.toArray()

  if (storedData.length > 0) {
    pushToDebugLog({
      activity: logActivity,
      level: 'INFO',
      message: 'Hydrating store...',
    })
    storedData.forEach(({ state, reducer }) => {
      //do a check here for the action to exist, since we've seen errors related to calling hydrate of undefined
      const action = actions[reducer.replace(SYNC_KEY, '')]
      if (action !== undefined) {
        store.dispatch(action.hydrate(state))
      }
    })
  }
}
