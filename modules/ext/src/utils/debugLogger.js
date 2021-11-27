// class to facilitate repeat calls to debug log within same context
import { store, actions } from 'state'
import { constructLogLine } from 'plugins/debugLog/utils'

export const queryDebugLogTab = async () =>
  browser.tabs.query({
    url: window.location.origin + '/debugLog-viewer.html',
  })

export const openDebugLogView = async () => {
  const tabs = await queryDebugLogTab()

  return !tabs.length
    ? browser.tabs.create({ url: 'debugLog-viewer.html' })
    : browser.tabs.update(tabs[0].id, { active: true })
}

/**
 * @param {Object} options
 * @param {Function} options.dispatch - would only override this if calling from component, defaults to store.dispatch
 * @param {string} options.tag - popup or background
 * @param {string} options.level - one of INFO, ERROR or DEBUG
 * @param {string} options.activity - relevant section of app logic
 */
export default ({
  dispatch = store.dispatch,
  tag = 'background', //most commonly used
  level = 'INFO',
  activity = null,
  message = null,
}) => {
  if (!activity || !message) {
    console.warn(
      'No activity or message specified in logger',
      tag,
      level,
      activity,
      message,
    )
  }

  const logLineData = {
    timestamp: Date.now(),
    tag,
    level,
    activity,
    message,
  }

  // Query for debug log tab and send a message if there are debug log tabs open.
  queryDebugLogTab().then(tabs => {
    if (tabs.length) {
      browser.runtime
        .sendMessage({
          type: 'cs_debug-log-entry',
          payload: constructLogLine(logLineData),
        })
        .catch(e => e)
    }
  })

  dispatch(actions.debugLog.push(logLineData))
}
