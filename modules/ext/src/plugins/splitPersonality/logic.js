import { random } from 'lodash'
import { platforms } from 'utils/constants'
import { FILTER } from 'utils/constants'
import listen from 'utils/listen'
import pushToDebugLog from 'utils/debugLogger'

let uaListener
let removeUaListener = () => {}

const userAgentListener = getState => ({ requestHeaders }) => {
  if (!getState().splitPersonalityEnabled) {
    return
  }
  const userAgentHeaderIndex = requestHeaders.findIndex(
    ({ name }) => name === 'User-Agent',
  )
  const spoofedUserAgent = getState().userAgent.spoofed
  // if UA index exists, we spoof it no matter what
  if (userAgentHeaderIndex > -1 && spoofedUserAgent) {
    requestHeaders[userAgentHeaderIndex].value = spoofedUserAgent
  }
  return { requestHeaders }
}

export default actions => [
  {
    type: actions.userAgent.getuseragentlist,
    async process({ action }, dispatch, done) {
      const { logActivity, dataSourceURL } = action?.payload || {}
      try {
        pushToDebugLog({
          activity: logActivity,
          message: `Fetching user agents`,
        })
        const res = await fetch(dataSourceURL)
        const uaTxt = await res.text()
        const originalUa = navigator.userAgent
        const currentPlatform = platforms.find(pl => originalUa.includes(pl))

        // filter out your own UA if in list, and use platform specific UA's
        if (currentPlatform) {
          const uaList = uaTxt
            .split(/\r?\n/)
            .filter(ua => ua !== originalUa)
            .reduce((acc, ua) => {
              if (ua.includes(currentPlatform)) {
                acc.push(ua)
              }
              return acc
            }, [])

          dispatch(
            actions.userAgent.assign({
              list: uaList,
            }),
          )
          pushToDebugLog({
            activity: logActivity,
            message: 'Successfully fetched user agent list',
          })
        }
      } catch (error) {
        pushToDebugLog({
          activity: logActivity,

          level: 'ERROR',
          message: `Error while fetching user agent list: ${JSON.stringify(
            error,
          )}`,
        })
        console.error(error)
      }
      done()
    },
  },
  {
    type: actions.userAgent.activate,
    async process({ getState }, dispatch, done) {
      uaListener = userAgentListener(getState)
      removeUaListener = listen(
        browser.webRequest.onBeforeSendHeaders,
        uaListener,
        FILTER,
        ['blocking', 'requestHeaders'],
      )

      done()
    },
  },
  {
    type: actions.userAgent.deactivate,
    async process() {
      removeUaListener()
    },
  },
  {
    type: actions.userAgent.randomize,
    process({ getState, action }, dispatch, done) {
      const { logActivity } = action?.payload || {}

      const { userAgent, splitPersonalityEnabled } = getState()
      let userAgentList = userAgent.list
      if (!splitPersonalityEnabled) {
        return done()
      }
      // in case there is no list, refetch.
      if (!userAgentList || userAgentList.length === 0) {
        dispatch(actions.splitPersonalityEnabled.set(false))
        dispatch(actions.userAgent.deactivate())
        pushToDebugLog({
          activity: logActivity,
          message: 'No userAgent list...',
        })
        return done()
      }

      if (userAgent.spoofed) {
        // do not pick the same Ua as before
        userAgentList = userAgentList.filter(uA => uA !== userAgent.spoofed)
      }

      const randomizedUa = userAgentList[random(0, userAgentList.length - 1)]

      pushToDebugLog({
        activity: logActivity,
        message: `User agent randomized to ${randomizedUa}`,
      })

      dispatch(
        actions.userAgent.assign({
          spoofed: randomizedUa,
        }),
      )

      done()
    },
  },
]
