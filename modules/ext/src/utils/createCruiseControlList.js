import { flatten } from 'lodash'
import pickHosts from './pickHosts'
import { store } from 'state'

export default ({ serverlist, userPremiumStatus, cruiseControlDomains }) => {
  // we only care about servers we can actually access
  const filteredServerList = serverlist
    .filter(location => location.premium_only <= userPremiumStatus)
    .map(filteredLocation => {
      const filteredGroups = filteredLocation.groups?.filter(
        dataCenter => dataCenter.pro <= userPremiumStatus,
      )
      return { ...filteredLocation, groups: filteredGroups }
    })

  return filteredServerList
    .filter(loc => Object.keys(cruiseControlDomains).includes(loc.short_name))
    .map(loc => ({
      ...loc,
      domains: cruiseControlDomains[loc.short_name],
      hosts: pickHosts(
        flatten(Object.values(loc.groups)?.map(group => group.hosts)).filter(
          Boolean,
        ),
      ),
    }))
}

export const stringify = cruiseControlList => {
  const proxyPort = store.getState().proxyPort

  return cruiseControlList
    .map(
      loc =>
        `if ([${flatten(
          loc.domains.map(domain => [`'*://${domain}/*'`, `'*.${domain}/*'`]),
        )}].some(d => shExpMatch(url, d))) {
      return '${loc.hosts.map(x => `HTTPS ${x}:${proxyPort}`).join('; ')}'
    }`,
    )
    .join('\n')
}
