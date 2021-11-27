import { getDb } from 'utils/db'
import { format } from 'date-fns'
import api from 'api'
import { IS_CHROME } from 'utils/constants'

// items we want represented in the debugLog initially
export const userStateKeysMap = [
  'splitPersonalityEnabled',
  'cookieMonsterEnabled',
  'cookieMonsterOnlyThirdParty',
  'locationSpooferEnabled',
  'proxyTimeEnabled',
  'allowSystemNotifications',
  'notificationBlockerEnabled',
  'autoConnect',
  'webRTCEnabled',
  'advancedModeEnabled',
  'blockListsEnabled',
]

export const isRequired = e => {
  throw new Error(`debug ${e} is required`)
}

export const parseUserState = (state, itemsToPull = []) => {
  if (!state) {
    return 'No original state'
  }
  return Object.keys(state).reduce((acc, key) => {
    if (itemsToPull?.includes(key)) {
      acc += `${key} : ${state[key]} \n`
    }
    return acc
  }, '')
}

export async function generateLogHeader({
  originalUserAgent,
  currentOS,
  currentExtVer = browser.runtime.getManifest().version,
  originalUserStashState,
}) {
  let currentBrowser = api.getConfig().platform
  const ua = originalUserAgent || navigator?.userAgent
  // this regex fails in firefox...
  const { 2: uaOsDetails, 5: uaBrowserDetails } = ua
    .toString()
    .match(/(\((.*?)\)\s(.*?)\s\((.*?)\)\s(.*?)\s)/) || {
    2: 'unable to parse os',
    5: 'unable to parse browser',
  }

  if (!IS_CHROME) {
    const { version } = await browser.runtime.getBrowserInfo()
    currentBrowser += ` ${version}`
  }

  const str = `
    [DeviceInfo]
    -------------
    [OS]: ${currentOS}
    [UserAgent OS]: ${uaOsDetails}
    [Browser]: ${currentBrowser}
    [UserAgent Browser]: ${uaBrowserDetails}
    [Extension]: ${currentExtVer}

    [User State]
    ------------------------------------------------------
    ${parseUserState(originalUserStashState, userStateKeysMap)}
    `
  return str.replace(/^ +/gm, '')
}

export const constructLogLine = data => {
  const time = format(data.timestamp, 'DD MMMM;HH:mm:ss.SSS')
  const tag = data.tag?.padEnd(10)
  const level = data.level?.padEnd(5)
  const activity = data.activity?.padEnd(20)
  let message = data.message?.padEnd(50)

  if (data?.repeatCount) {
    message += ` x${data.repeatCount}`
  }

  return `${time} [${tag}] [${level}] [${activity}] - ${message} \n`
}

export async function constructDebugLog() {
  const db = getDb()
  const storedLogs = await db.WS_LOGS.toArray()
  const parsedLogs = storedLogs.reduce((acc, lineData) => {
    const logLine = constructLogLine(lineData)

    acc += logLine
    return acc
  }, '[Start of log]\n------------------------------------------------------\n')

  return parsedLogs
}
