import globals from 'utils/globals'
import qs from 'query-string'
import api from 'api'
import { IS_CHROME } from 'utils/constants'

const addParams = params => {
  const queryString = qs.stringify(params)

  /* qs with an empty object returns empty string */
  if (queryString.length === 0) {
    return ''
  }

  return `?${queryString}`
}
const addHash = hash => (hash ? `#${hash}` : '')
const addPath = path => (path.startsWith('/') ? path : `/${path}`)

export default async ({
  path,
  customRootUrl,
  params = {},
  hash = null,
  includeHash = true,
}) => {
  const rootUrl = customRootUrl || (await globals.ROOT_URL)
  if (!path) {
    console.error(`Param: path is undefined`)
    return
  }

  const sessionAuthHash = window.store.getState()?.session?.session_auth_hash

  if (sessionAuthHash && includeHash) {
    api.setConfig({
      apiUrl: await globals.API_URL,
      assetsUrl: await globals.ASSETS_URL,
      backupApiUrl: await globals.BACKUP_API_URL,
      backupAssetsUrl: await globals.BACKUP_ASSETS_URL,
      sessionAuthHash: sessionAuthHash,
      apiCallMinInterval: await globals.API_CALL_MIN_INTERVAL,
      platform: IS_CHROME ? 'chrome' : 'firefox',
    })

    const response = await api.post({
      endpoint: '/WebSession',
      params: {
        session_type_id: 1,
        temp_session: 1,
      },
    })

    return browser.tabs.create({
      url:
        rootUrl +
        addPath(path) +
        addParams({ ...params, temp_session: response?.data?.temp_session }) +
        addHash(hash),
    })
  }

  return browser.tabs.create({
    url: rootUrl + addPath(path) + addParams(params) + addHash(hash),
  })
}
