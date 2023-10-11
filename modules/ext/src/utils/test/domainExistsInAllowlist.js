import assert from 'assert'
import domainExistsInAllowlist from '../domainExistsInAllowlist'

const allowlist = [
  {
    domain: 'test.github.com',
    includeAllSubdomains: true,
    allowDirectConnect: false,
    allowAds: false,
    allowCookies: true,
  },
  {
    includeAllSubdomains: true,
    allowAds: false,
    allowCookies: true,
    allowDirectConnect: false,
    domain: 'www.google.ca',
  },
  {
    domain: 'maps.google.ca',
    includeAllSubdomains: false,
    allowAds: false,
    allowCookies: true,
    allowDirectConnect: false,
  },
]

const defaultUrl = 'https://test.github.com/'

const isAllowlisted = (domain, url = defaultUrl) =>
  domainExistsInAllowlist({ domain, allowlist, url })

/* Should find matching domain in allowlist' */
describe('Check allowlist', () => {
  it('Should find matching domain in allowlist', () =>
    assert(isAllowlisted('maps.google.ca', 'https://maps.google.ca')))

  it('Should find domain that has different subdomain', () =>
    assert(isAllowlisted('github.com')))
})
