import logic from './logic'
import { constructDebugLog, generateLogHeader } from './utils'
import { store, actions } from 'state'
import { openDebugLogView } from 'utils/debugLogger'
import { getDb } from 'utils/db'

export default {
  lexiconEntries: [
    {
      name: 'debugLog', //no state will be stored on this key, just use for actions
    },
    {
      name: 'debugLogReportResponse',
      initialState: null,
    },
    {
      name: 'lastDebugLogCheck',
      initialState: null,
    },
    {
      name: 'originalUserStashState', // this is what gets prepended to the debugLog
      initialState: null,
    },
    {
      name: 'showDebugContextMenu',
      initialState: true,
      stash: true,
    },
  ],
  initialize() {
    const show = store.getState().showDebugContextMenu || false
    if (browser.contextMenus && show) {
      browser.contextMenus.create({
        id: 'view-debug-log',
        title: 'View Debug Log',
        contexts: ['all'],
      })
    }
  },
  async onContextMenuClicked(info) {
    if (info.menuItemId === 'view-debug-log') {
      openDebugLogView()
    }
  },
  onMessage: {
    'construct-log-header': async (_, { resolve, reject }) => {
      const { currentOS, originalUserStashState, userAgent } = store.getState()

      try {
        const header = await generateLogHeader({
          currentExtVer: browser.runtime.getManifest().version,
          currentOS,
          originalUserStashState,
          originalUserAgent: userAgent.original,
        })

        resolve(header)
      } catch (e) {
        reject(e)
      }
    },
    'construct-debug-log': (_, { resolve, reject }) => {
      const { currentOS, originalUserStashState, userAgent } = store.getState()
      constructDebugLog({ currentOS, originalUserStashState, userAgent })
        .then(resolve)
        .catch(reject)
    },
    'clear-debug-log': (_, { resolve }) => {
      const db = getDb()
      db.WS_LOGS.clear()
      store.dispatch(actions.debugLog.clear())
      resolve()
    },
  },
  logic,
}
