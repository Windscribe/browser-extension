import _moment from 'moment-timezone'
import offsets from './timezone-offsets'
import listen from 'utils/listen'
import pushToDebugLog from 'utils/debugLogger'

const moment = _moment()
const d = new Date()
const defaultOffset = d.getTimezoneOffset()

let unsubscribeTimezoneListener = null

const injectDatePrefs = async ({ tabId }) => {
  const { tzSpoofer } = await browser.storage.local.get('tzSpoofer')
  if (!tzSpoofer) {
    return
  }

  const { location, standard, daylight, offset = 0, isDST } = tzSpoofer

  const msg = isDST === 'false' ? standard : daylight

  return browser.tabs
    .executeScript(tabId, {
      runAt: 'document_start',
      matchAboutBlank: true,
      code: `(document.head || document.documentElement).appendChild(Object.assign(document.createElement('script'), {
          textContent: 'Date.prefs = ["${location}", ${
        -1 * offset
      }, ${defaultOffset}, "${msg}"];'
        })).remove();`,
      allFrames: true,
    })
    .catch(err => err)
}

/* Listener handler */
const timezoneListener = async ({ url, tabId }) => {
  if (!url?.startsWith('http')) {
    return false
  }

  return injectDatePrefs({ tabId })
}

const set = async (location = 'default') => {
  const { offset, storage } = analyze(location)

  await browser.storage.local.set({
    tzSpoofer: {
      offset,
      location,
      isDST: offset !== storage.offset,
      daylight: storage.msg.daylight,
      standard: storage.msg.standard,
    },
  })
}

const analyze = timezone => {
  const m = moment.tz(timezone)
  const country = timezone.split('/')[1].replace(/[-_]/g, ' ')
  const storage = offsets[timezone] || {
    offset: m.utcOffset(),
    msg: {
      standard: country + ' Standard Time',
      daylight: country + ' Daylight Time',
    },
  }
  storage.msg = storage.msg || {
    standard: country + ' Standard Time',
    daylight: country + ' Daylight Time',
  }
  return {
    offset: m.utcOffset(),
    storage,
  }
}

const setProxyTime = async ({ enabled, currentLocation, proxy }) => {
  if (unsubscribeTimezoneListener) {
    await unsubscribeTimezoneListener()
    unsubscribeTimezoneListener = null
  }

  unsubscribeTimezoneListener = listen(
    browser.webNavigation.onCommitted,
    timezoneListener,
  )

  const tabs = await browser.tabs.query({ windowType: 'normal' })

  if (enabled && proxy.status === 'connected') {
    tabs?.forEach(async t => {
      await injectDatePrefs({ tabId: t.id })
      await browser.tabs.sendMessage(t.id, { type: 'shift-time' }).catch(e => {
        pushToDebugLog({
          activity: 'shift-time',
          message: `Could not inject shift-time script into tab: ${e.toString()}`,
        })
      })
    })
  } else {
    tabs?.forEach(t =>
      browser.tabs.sendMessage(t.id, { type: 'proxy-time-off' }).catch(e => e),
    )
  }

  try {
    const tz = currentLocation?.timezone

    const { tzSpoofer } = await browser.storage.local.get('tzSpoofer')
    if (tz && (!tzSpoofer || tzSpoofer?.location !== tz)) {
      set(tz)
    }
  } catch (e) {
    console.error(e)
  }
}

export default actions => [
  {
    type: [actions.proxyTimeEnabled.setandlog, actions.proxyTimeEnabled.set],
    latest: true,
    async process({ getState, action }, dispatch, done) {
      let isEnabled = action.payload?.value

      if (isEnabled === undefined) {
        isEnabled = action.payload
      }

      const { currentLocation, proxy } = getState()
      await setProxyTime({ enabled: isEnabled, currentLocation, proxy })
      done()
    },
  },
  {
    type: actions.proxy.assign,
    latest: true,
    async process({ getState }, dispatch, done) {
      const { proxyTimeEnabled, currentLocation, proxy } = getState()
      if (!proxyTimeEnabled) {
        return done()
      }

      if (currentLocation.name === 'cruise_control') {
        await setProxyTime({ enabled: false })
      } else {
        await setProxyTime({ enabled: true, currentLocation, proxy })
      }

      done()
    },
  },
  {
    type: [actions.proxy.deactivate, actions.auth.logout],
    latest: true,
    async process({ getState }, dispatch, done) {
      const { proxyTimeEnabled } = getState()
      if (proxyTimeEnabled) {
        if (unsubscribeTimezoneListener) {
          await unsubscribeTimezoneListener()
          unsubscribeTimezoneListener = null
        }
        await setProxyTime({ enabled: false })
      }
      done()
    },
  },
]
