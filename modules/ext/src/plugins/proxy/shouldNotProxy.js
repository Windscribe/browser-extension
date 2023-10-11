import api from 'api'

// These functions exist in the pac sandbox, but not in the typical browser env

export const isPlainHostName = host => host.indexOf('.') === -1

// TODO: this is not working properly!

// The pacfile sandbox version of this function works since it knows about
// shell expressions. We need to find out how to write the equivalent function
// for the normal browser runtime.

export function shExpMatch(url, pattern) {
  var pCharCode
  var isAggressive = false
  var pIndex
  var urlIndex = 0
  var lastIndex
  var patternLength = pattern.length
  var urlLength = url.length
  for (pIndex = 0; pIndex < patternLength; pIndex += 1) {
    pCharCode = pattern.charCodeAt(pIndex) // use charCodeAt for performance, see http://jsperf.com/charat-charcodeat-brackets
    if (pCharCode === 63) {
      // use if instead of switch for performance, see http://jsperf.com/switch-if
      if (isAggressive) {
        urlIndex += 1
      }
      isAggressive = false
      urlIndex += 1
    } else if (pCharCode === 42) {
      if (pIndex === patternLength - 1) {
        return urlIndex <= urlLength
      } else {
        isAggressive = true
      }
    } else {
      if (isAggressive) {
        lastIndex = urlIndex
        urlIndex = url.indexOf(String.fromCharCode(pCharCode), lastIndex + 1)
        if (urlIndex < 0) {
          if (url.charCodeAt(lastIndex) !== pCharCode) {
            return false
          }
          urlIndex = lastIndex
        }
        isAggressive = false
      } else {
        if (urlIndex >= urlLength || url.charCodeAt(urlIndex) !== pCharCode) {
          return false
        }
      }
      urlIndex += 1
    }
  }
  return urlIndex === urlLength
}

/* ⚠️   IMPORTANT   ⚠️ */
/*
  This function gets stringified for pac files.
  It cannot reference variables or functions not defined in the pac sandbox.
*/

// if this returns true then proxy should go DIRECT

export default function shouldNotProxy(url, host, userAllowlist) {
  const { workingApi } = api.getConfig()

  const lanIps = /(^(127|10)\.\d{1,3}\.\d{1,3}\.\d{1,3}$)|(^192\.168\.\d{1,3}\.\d{1,3}$)|(^172\.1[6-9]\.\d{1,3}\.\d{1,3}$)|(^172\.2[0-9]\.\d{1,3}\.\d{1,3}$)|(^172\.3[0-1]\.\d{1,3}\.\d{1,3}$)/

  const allowlist = [
    '*://api.windscribe.com/*',
    '*://assets.windscribe.com/*',
    '*://*.staticnetcontent.com/*',
    '*://api.totallyacdn.com/*',
    '*://assets.totallyacdn.com/*',
    'https://windscribe.com/installed/*',
  ].concat(userAllowlist)

  if (workingApi !== '.windscribe.com') {
    allowlist.push(`*://api${workingApi}/*`, `*://assets${workingApi}/*`)
  }

  return [
    isPlainHostName(host),
    // if it is NOT an allowed protocol then go direct
    // TODO: how to test local protocols?
    ['http', 'ftp', 'ws'].every(protocol => !url.startsWith(protocol)),
    lanIps.test(host),
    allowlist.some(pattern => shExpMatch(url, pattern)),
  ].some(_ => _)
}
