import md5 from 'md5'
import sleep from 'shleep'
import { ACCOUNT_STATES } from 'utils/constants'
import { getDb } from 'utils/db'
import { updateFilterLists, reloadAllFilterLists } from 'plugins/ublock/utils'
import getEntries from 'plugins/lexicon'
import pushToDebugLog from 'utils/debugLogger'
import api from 'api'

/* We should remove all lists not related to windscribe. and unset all the ones that are  */
const cleanupUboLists = async blockLists => {
  /* Get the custom lists */
  const availableUboLists = await µBlock.getAvailableLists()

  const customLists = Object.values(availableUboLists).filter(
    x => x.group === 'custom',
  )

  const windscribeBlockListUrls = blockLists.reduce(
    (array, { lists }) => array.concat(lists.map(x => x.url)),
    [],
  )
  /* Filter the non windscribe lists away */
  const toRemove = customLists
    .filter(
      x => !x.contentURL.every(url => windscribeBlockListUrls.includes(url)),
    )
    .reduce((arr, item) => arr.concat(item.contentURL), [])

  await updateFilterLists({ toSelect: [], toRemove })
  return reloadAllFilterLists()
}

export default actions => ({
  type: actions.auth.logout,
  latest: true,
  async process({ action, getState }, dispatch, done) {
    const { logActivity, clearLog = true } = action?.payload || {}

    const state = getState()

    // Remove session poller right away
    dispatch(actions.sessionPoller.deactivate({ logActivity }))

    dispatch(actions.view.set('LoggingOut'))

    await Promise.all([
      cleanupUboLists(state.blockLists.list),
      clearLog ? getDb().WS_LOGS.clear() : Promise.resolve(),
    ])

    const banned = state.session.status === ACCOUNT_STATES.BANNED

    const hash = md5(state.session.username)
    if (!banned) {
      pushToDebugLog({
        activity: logActivity,
        message: `Storing user (${state.session.username}) state`,
      })
      // stash users settings for hydrating on login
      dispatch(
        actions.userStashes.produce(stashState => {
          stashState[hash] = getEntries().reduce((acc, d) => {
            if (d.stashOnLogout) {
              acc[d.name] = state[d.name]
            }
            return acc
          }, {})
        }),
      )
    } else {
      // if they're banned then remove their stash entirely
      pushToDebugLog({
        activity: logActivity,
        message: `Clearing banned user (${state.session.username}) state`,
      })
    }

    dispatch(
      actions.proxy.deactivate({
        logActivity,
        // Even if the proxy is off, making sure we cleanup is important
        notification:
          state.allowSystemNotifications && state.proxy.status === 'connected',
        logout: true,
      }),
    )

    // decreases session count by 1
    api.delete({
      endpoint: '/Session',
      params: {
        session_type_id: 2,
      },
    })

    const doNotClearOnLogout = ['expiredUsername', 'userStashes', 'bgReady']
    // this is to retain error message from being logged out via invalid session
    const sessionError = state.session.error
    if (sessionError) {
      doNotClearOnLogout.push('session')
      // setting error, will be shown on login page
      dispatch(actions.session.set({ error: sessionError }))
    }

    if (banned) {
      dispatch(actions.view.set('Banned'))
    } else {
      /* This should be the LAST thing that runs */
      Object.entries(actions)
        .filter(([k]) => k !== 'view')
        .forEach(([reducer, action]) => {
          if (!doNotClearOnLogout.includes(reducer))
            action.default && dispatch(action.default())
        })

      await sleep(550)
      dispatch(actions.view.default())
    }

    done()
  },
})
