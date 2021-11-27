import assert from 'assert'
import domainExistsInWhitelist from '../domainExistsInWhitelist'

const whitelist = [
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

const isWhitelisted = (domain, url = defaultUrl) =>
  domainExistsInWhitelist({ domain, whitelist, url })

/* Should find matching domain in whitelist' */
describe('Check whitelist', () => {
  it('Should find matching domain in whitelist', () =>
    assert(isWhitelisted('maps.google.ca', 'https://maps.google.ca')))

  it('Should find domain that has different subdomain', () =>
    assert(isWhitelisted('github.com')))
})
