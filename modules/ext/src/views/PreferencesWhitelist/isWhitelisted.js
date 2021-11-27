export const isWhitelisted = ({ hostname, subDomain = false, whitelist }) => {
  /* eslint-disable */
  const whiteListDomain = whitelist.find(({ domain }) => domain == hostname)

  const subDomainAndDomainUndefined = !subDomain && whiteListDomain

  const whiteListDomainExistsAndIncluded =
    whiteListDomain && whiteListDomain.includeAllSubDomains

  if (subDomainAndDomainUndefined || whiteListDomainExistsAndIncluded)
    return true

  const splitHostName = hostname.split('.')

  if (splitHostName.length > 2) {
    const [, ...rest] = splitHostName

    return isWhitelisted({
      hostname: rest.join('.'),
      subDomain: true,
      whitelist,
    })
  }

  return true
}
