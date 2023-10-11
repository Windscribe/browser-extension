// TODO: this file is getting minified in the build and breaking the pacfile
// import shouldNotProxy from 'plugins/proxy/shouldNotProxy'
import { stringify } from 'utils/createCruiseControlList'
import api from 'api'
import { store } from 'state'

// get array of hostnames if exists (used for fallbacks)
const getParsedHostnamesString = (hostnames, proxyPort) => {
  if (hostnames?.length > 0) {
    return hostnames.reduce((acc, hostname) => {
      //convert each into proxy list format
      acc += `HTTPS ${hostname}:${proxyPort};`
      return acc
    }, '')
  } else {
    return null
  }
}

/* eslint-disable no-useless-escape */
const createFindProxyForURLFunction = ({
  hostnames = [],
  cruiseControlList,
  allowlist = [],
}) => {
  const { workingApi } = api.getConfig()
  const proxyPort = store.getState().proxyPort

  const pac = `
  function FindProxyForURL (url, host) {
    function shouldNotProxy(url, host, userAllowlist) {
      let lanIps = /(^(127|10)\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$)|(^192\\.168\\.\\d{1,3}\\.\\d{1,3}$)|(^172\\.1[6-9]\\.\\d{1,3}\\.\\d{1,3}$)|(^172\\.2[0-9]\\.\\d{1,3}\.\\d{1,3}$)|(^172\\.3[0-1]\\.\\d{1,3}\\.\\d{1,3}$)/

      let allowlist = [
        '*://api.windscribe.com/*',
        '*://assets.windscribe.com/*',
        '*://*.staticnetcontent.com/*',
        '*://api.totallyacdn.com/*',
        '*://assets.totallyacdn.com/*',
        ${
          workingApi !== '.windscribe.com'
            ? `'*://api${workingApi}/*', 
            '*://assets${workingApi}/*',`
            : ''
        }
        'https://windscribe.com/installed/*',
      ].concat(userAllowlist)

      return [
        isPlainHostName(host),
        // if it is NOT an allowed protocol then go direct
        // TODO: how to test local protocols?
        ['http', 'ftp', 'ws'].every(protocol => !url.startsWith(protocol)),
        lanIps.test(host),
        allowlist.some(pattern => shExpMatch(url, pattern)),
      ].some(_ => _)
    }
    let allowlist = ${JSON.stringify(allowlist)}
    if (shouldNotProxy(url, host, allowlist)) {
      return 'DIRECT'
    }
    ${cruiseControlList ? stringify(cruiseControlList) : ''}
    return '${getParsedHostnamesString(hostnames, proxyPort)}'
  }
`
  return pac
}
/* eslint-enable */

export default config =>
  new Promise(resolve =>
    browser.proxy.settings.set(
      {
        value: {
          mode: 'pac_script',
          pacScript: {
            data: createFindProxyForURLFunction(config),
            mandatory: true,
          },
        },
        scope: 'regular',
      },
      resolve,
    ),
  )
