import api from 'api'
import { wrapStore } from 'webext-redux'
import globals from 'utils/globals'
import { initDb } from 'utils/db'
import { store, actions } from 'state'
import { IS_CHROME } from 'utils/constants'
import * as browserEvents from './browser_events'
import hydrate from 'utils/hydrateStore'
import setIcon from 'utils/setIcon'
import { isParsed, initSuffixList } from 'utils/parse-suffix-list'
import pushToDebugLog from 'utils/debugLogger'
import * as plugins from 'plugins'

import { updateFilterLists, reloadAllFilterLists } from 'plugins/ublock/utils'

const ACTIVITY = 'background_setup'

// --
;(async () => {
  wrapStore(store, {
    portName: process.env.REACT_APP_REDUX_PORT || 'WS_BROWSER_EXTENSION_STORE',
  })
  //This is to make sure we send the ready to the popup
  setTimeout(() => {
    store.dispatch(actions.bgReady.set(true))
  }, 4000)

  // set icon as soon as possible
  setIcon()

  try {
    await initDb()
  } catch (e) {
    pushToDebugLog({
      activity: ACTIVITY,
      level: 'ERROR',
      message: `Initializing db threw ${JSON.stringify(e)}`,
    })

    store.dispatch(
      actions.view.set(
        e.message === 'firefox-in-private-mode'
          ? 'FirefoxPrivateMode'
          : 'SomethingWeird',
      ),
    )
  }

  await hydrate({ logActivity: 'background_setup' })

  if (globals.GLOBAL_ERROR_LOG) {
    window.addEventListener('error', event => {
      pushToDebugLog({
        activity: ACTIVITY,
        level: 'ERROR',
        message: `Event listener caught window err: ${event}`,
      })
    })
  }

  // TODO: set this on all calls
  api.setConfig({
    apiUrl: await globals.API_URL,
    assetsUrl: await globals.ASSETS_URL,
    backupApiUrl: await globals.BACKUP_API_URL,
    backupAssetsUrl: await globals.BACKUP_ASSETS_URL,
    sessionAuthHash: store.getState().session.session_auth_hash,
    apiCallMinInterval: await globals.API_CALL_MIN_INTERVAL,
    platform: IS_CHROME ? 'chrome' : 'firefox',
  })

  await Promise.all(
    Object.values(plugins).map(p => {
      if (p.initialize) return p.initialize()
      else return Promise.resolve()
    }),
  )

  // listeners + handlers for things like tabs, connectivity
  await Promise.all(Object.values(browserEvents).map(fn => fn()))

  if (!isParsed()) {
    initSuffixList()
  }

  if (
    !store.getState().missingUserFilter &&
    !µBlock.selectedFilterLists.includes('user-filters')
  ) {
    await updateFilterLists({
      toSelect: [...µBlock.selectedFilterLists, 'user-filters'],
    })
    await reloadAllFilterLists()
    store.dispatch(actions.missingUserFilter.set(true))
  }

  await reloadAllFilterLists()

  //let the popup know that bg has been initialized
  store.dispatch(actions.bgReady.set(true))
})()

if (process.NODE_ENV !== 'production') {
  // If this were imported at the top of the file it would be bundled in even when in prod.
  import('tests/setup').then(module => module.default())
}
