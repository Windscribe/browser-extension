export const isAllowlisted = ({ hostname, subDomain = false, allowlist }) => {
  /* eslint-disable */
  const allowListDomain = allowlist.find(({ domain }) => domain == hostname)

  const subDomainAndDomainUndefined = !subDomain && allowListDomain

  const allowListDomainExistsAndIncluded =
    allowListDomain && allowListDomain.includeAllSubDomains

  if (subDomainAndDomainUndefined || allowListDomainExistsAndIncluded)
    return true

  const splitHostName = hostname.split('.')

  if (splitHostName.length > 2) {
    const [, ...rest] = splitHostName

    return isAllowlisted({
      hostname: rest.join('.'),
      subDomain: true,
      allowlist,
    })
  }

  return true
}
