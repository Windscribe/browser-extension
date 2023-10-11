import { flatten } from 'lodash'
import { FILTER } from 'utils/constants'
import shouldNotProxy, { shExpMatch } from 'plugins/proxy/shouldNotProxy'
import { firefoxAllowlistTransform } from 'plugins/allowlist/transform'
import listen from 'utils/listen'

let handleOnRequest

export default actions => ({
  type: actions.proxy.setuponrequest,
  latest: true,
  warnTimeout: 0,
  async process({ getState }, dispatch, done) {
    if (handleOnRequest) return done()

    handleOnRequest = d => {
      const {
        proxy,
        proxyPort,
        allowlist,
        currentLocation,
        cruiseControlList,
        bestLocation,
      } = getState()

      if (
        proxy.status === 'disconnected' ||
        proxy.status === 'disconnecting' ||
        shouldNotProxy(
          d.url,
          new URL(d.url).hostname,
          flatten(firefoxAllowlistTransform(allowlist)),
        )
      ) {
        return { type: 'DIRECT' }
      }

      const mapHosts = host => ({
        type: 'https',
        port: proxyPort,
        host,
      })

      let hosts = null
      // "autopilot" aka "cruise control"
      if (currentLocation.name === 'cruise_control') {
        const loc = cruiseControlList.data.find(loc =>
          flatten(
            loc.domains.map(d => [`*://${d}/*`, `*.${d}/*`]),
          ).some(domainPattern => shExpMatch(d.url, domainPattern)),
        )

        if (loc) {
          hosts = loc.hosts.map(mapHosts)
        } else {
          hosts = bestLocation.hosts.map(mapHosts)
        }
      } else {
        hosts = currentLocation.hosts.map(mapHosts)
      }
      if (hosts?.length > 0) {
        return hosts
      } else {
        return hosts
      }
    }
    listen(browser.proxy.onRequest, handleOnRequest, FILTER)
  },
})
