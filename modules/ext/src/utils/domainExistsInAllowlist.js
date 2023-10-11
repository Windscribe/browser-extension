import splitHostnameFromURL from './splitHostnameFromURL'

const setupHostnameMap = url => domain =>
  splitHostnameFromURL(url).includes(domain)

export default ({ allowlist = [], url = '', domain = '' }) => {
  const checkHostnameMap = setupHostnameMap(url)

  return Object.entries(allowlist).some(
    ([, x]) =>
      (x.includeAllSubdomains
        ? checkHostnameMap(x.domain)
        : x.domain === domain) && x.allowCookies,
  )
}
