import _moment from 'moment-timezone'
import offsets from './timezone-offsets'

const moment = _moment()
const d = new Date()
const defaultOffset = d.getTimezoneOffset()

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

const setTimeWarp = async (currentLocation = 'default', proxy) => {
  if (proxy.status === 'connected') {
    const { offset, storage } = analyze(currentLocation.timezone)
    const msg =
      (offset !== storage.offset) === 'false'
        ? storage.msg.standard
        : storage.msg.daylight

    await browser.storage.local.set({
      timeWarp: {
        location: currentLocation.timezone,
        offset: -1 * offset,
        defaultOffset,
        dst: msg,
      },
    })
  }
}

export default actions => [
  {
    type: [actions.proxyTimeEnabled.setandlog, actions.proxyTimeEnabled.set],
    latest: true,
    async process({ getState }, dispatch, done) {
      const { currentLocation, proxy } = getState()
      setTimeWarp(currentLocation, proxy)
      done()
    },
  },
  {
    type: actions.proxy.assign,
    latest: true,
    async process({ getState }, dispatch, done) {
      const { proxyTimeEnabled, currentLocation, proxy } = getState()

      if (currentLocation.name === 'cruise_control') {
        await browser.storage.local.set({
          timeWarp: null,
        })
      } else if (proxyTimeEnabled) {
        setTimeWarp(currentLocation, proxy)
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
        await browser.storage.local.set({
          timeWarp: null,
        })
      }
      done()
    },
  },
]
