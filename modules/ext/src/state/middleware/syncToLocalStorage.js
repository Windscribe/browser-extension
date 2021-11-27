import { isEqual, omit } from 'lodash'
import { SYNC_KEY } from 'utils/constants'
import log, { logGroup } from 'utils/log'
import { getDb } from 'utils/db'
import syncLogger from 'utils/debugLogger'

const logUpdate = async ({ type }, reducer) => {
  const db = getDb()
  try {
    const { state } = await db.WS_STATE.get(SYNC_KEY + reducer)
    logGroup(
      `local-storage Updated, ${type}`,
      '%c state',
      'color: green;',
      state,
    )
  } catch (e) {
    console.error('DEXIE ERROR', e)
  }
}

const sync = async ({ reducer, state, action }) => {
  const db = getDb()
  try {
    await db.WS_STATE.put({ reducer: SYNC_KEY + reducer, state })
    process.env.NODE_ENV === 'development' && logUpdate(action, reducer)
  } catch (e) {
    console.error('DEXIE ERROR', e)
  }
}

export default whitelist => store => next => action => {
  /* TODO: Currently the whitelist only includes reducers
    Maybe later we'll want more granularity and include action types as well
  */
  const [reducer] = action.type.split('_')
  if (window.LOG_ACTIONS) log(action)
  // Check if reducers is an array
  if (!Array.isArray(whitelist)) throw new Error('Reducer list is not an array')
  // No need to update the local store on init
  if (action.type.includes('HYDRATE') || action.type.includes('CLEAR')) {
    console.warn('skipping storage sync')
    return next(action)
  } else if (action.type.includes('ANDLOG')) {
    // special case
    const cleanActionTypeName = action.type.match(/\w+(?=.*_)/)[0]
    syncLogger({
      override: action?.payload?.override,
      activity: action?.payload?.logActivity,
      message: `Set ${cleanActionTypeName} to ${action.payload.value}`,
    })
  }

  const prevState = store.getState()[reducer]
  const result = next(action)
  const nextState = store.getState()[reducer]

  const asyncKeys = ['loading', 'error']
  const hasAsyncKeys = x => x?.loading

  if (whitelist.includes(reducer)) {
    if (
      hasAsyncKeys(prevState)
        ? !isEqual(omit(prevState, asyncKeys), omit(nextState, asyncKeys))
        : !isEqual(prevState, nextState)
    ) {
      sync({ reducer, state: nextState, action })
    }
  }

  return result
}
