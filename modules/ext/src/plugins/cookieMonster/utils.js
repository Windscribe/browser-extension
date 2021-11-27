import { camelCase, flattenDeep } from 'lodash'
import splitHostnameFromURL from 'utils/splitHostnameFromURL'
import { getDomain } from 'utils/parse-suffix-list'
import format from 'plugins/tabs/format'

export const parseCookie = value => {
  if (!value) {
    return null
  }

  return value.split(';').reduce((obj, cookieStr, i) => {
    const [key, value = ''] = cookieStr.split('=').map(str => str.trim())

    if (i === 0) {
      // This is the name
      obj.name = key

      return obj
    }

    obj[camelCase(key)] = value
    return obj
  }, {})
}

export const getAllCookiesFromDomain = domains =>
  domains.map(domain =>
    browser.cookies.getAll({
      domain: getDomain(domain),
    }),
  )

export const collectCookies = async ({
  cookieMonsterEnabled = true,
  cookieMonsterOnlyThirdParty,
  tab,
}) => {
  if (!cookieMonsterEnabled) return

  const { hostnameInvalid } = format(tab)
  if (hostnameInvalid) return

  let firstPartyCookies = []

  const domains = splitHostnameFromURL(tab.url)
  if (!domains.length) return

  if (!cookieMonsterOnlyThirdParty) {
    firstPartyCookies = await Promise.all(getAllCookiesFromDomain(domains))
  }

  const iframeCookies = await Promise.all(
    flattenDeep(
      (tab.iframeUrls || [])
        .map(splitHostnameFromURL)
        .map(getAllCookiesFromDomain),
    ),
  )

  const isFirstPartyCookie = c =>
    // TODO: filter known suffixes aka "co.uk"
    domains.some(domain => c.domain.endsWith(getDomain(domain)))

  /* Sort cookies into their collections, based on their party */
  const createCookieCollections = (cookies = []) =>
    cookies.reduce(
      (obj, c) => {
        const isFirstParty = isFirstPartyCookie(c)
        const key = isFirstParty ? 'firstParty' : 'thirdParty'

        obj[key] = obj[key].concat(c)

        return obj
      },
      {
        firstParty: [],
        thirdParty: [],
      },
    )

  const iframeCookieCollection = createCookieCollections(
    flattenDeep(iframeCookies),
  )

  // these are captured via onWebRequest
  const networkCookieCollection = createCookieCollections(tab.cookies || [])

  return {
    firstParty: cookieMonsterOnlyThirdParty
      ? []
      : [
          ...flattenDeep(firstPartyCookies),
          ...flattenDeep(iframeCookieCollection.firstParty),
          ...networkCookieCollection.firstParty,
        ],
    thirdParty: [
      ...flattenDeep(iframeCookieCollection.thirdParty),
      ...networkCookieCollection.firstParty,
    ],
  }
}
