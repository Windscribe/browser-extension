import qs from 'query-string'
import { RequestArgs, ApiException } from './commonTypes'
import { getConfig, setConfig } from './config'

interface PrepareValidUrlArgs {
  url: string
  assets?: boolean
  useBackup?: boolean
}

const prepareValidUrl = ({
  url,
  assets = false,
  useBackup = false,
}: PrepareValidUrlArgs) => {
  const { assetsUrl, apiUrl, backupApiUrl, backupAssetsUrl } = getConfig()

  const urlValidator = new RegExp(/^http|ftp|file:\/\//gim)
  // If it's a full url send use it as is
  if (urlValidator.test(url)) {
    return url
  }
  let baseUrl

  if (useBackup) {
    baseUrl = assets ? backupAssetsUrl : backupApiUrl
  } else {
    baseUrl = assets ? assetsUrl : apiUrl
  }

  // If it's a base endpoint without a / starting add it
  if (!urlValidator.test(url) && !url.startsWith('/')) {
    return `${baseUrl}/${url}`
    // If the endpoint has the slash return it with the base url
  } else if (!urlValidator.test(url) && url.startsWith('/')) {
    return baseUrl + url
  }
}

const _fetch = typeof fetch === 'function' ? fetch : require('node-fetch')

const sendRequest = async ({
  endpoint,
  debugOpts = {},
  opts = {},
  method = 'get',
  assets = false,
}: RequestArgs): Promise<Response> => {
  const RATE_LIMIT_ERROR_CODE = 7331
  /* Sets the url, if there's params it'll construct and append the params to the url */
  const defaultParams = { ...opts.params, platform: getConfig().platform }
  /*
      Sets up the config.
      if there's a key named method just pass the options object.
      if not, use the method argument.
    */
  const config = opts.method ? opts : { ...opts, method }

  const send = async (useBackup = false) => {
    const { lastCallTimeStamps = {}, apiCallMinInterval } = getConfig()
    const params =
      useBackup && endpoint.includes('ExtBlocklists') // Only need to add `domain` on ExtBlocklists
        ? { ...defaultParams, domain: 'staticnetcontent.com' }
        : defaultParams

    const apiUrl = prepareValidUrl({ url: endpoint, assets, useBackup })
    const url = apiUrl + `?${qs.stringify(params)}`
    const debugUrl = apiUrl
    global.url = debugUrl
    const timeToNextCall =
      Number(apiCallMinInterval) -
      (Date.now() - lastCallTimeStamps[endpoint] ?? 0)
    if (timeToNextCall > 0) {
      throw {
        code: RATE_LIMIT_ERROR_CODE,
        message: `Last call to ${endpoint} less than ${apiCallMinInterval}ms ago. Call aborted. Retry in ${timeToNextCall}ms`,
        debug: { debugUrl, debugOpts, lastCallTimeStamps, timeToNextCall },
        data: { debugUrl, debugOpts, lastCallTimeStamps, timeToNextCall },
      } as ApiException
    }
    try {
      setConfig({
        lastCallTimeStamps: { ...lastCallTimeStamps, [endpoint]: Date.now() },
      })
      const response = await _fetch(url, config)
      if (response.status === 404) {
        throw {
          code: response.status,
          message: response.statusText,
          debug: {
            debugUrl,
            debugOpts,
          },
          data: { debugUrl, debugOpts },
        } as ApiException
      }
      return response
    } catch (e) {
      console.error(e)
      throw {
        code: 0,
        message: `Error fetching url. ${e.message}`,
        debug: { debugUrl, debugOpts },
        data: { debugUrl, debugOpts },
      } as ApiException
    }
  }

  /* Make the request */
  return await fetch('https://api.windscribe.com')
    .then(async () => {
      const resp = await send()
      return resp
    })
    .catch(async e => {
      console.error(e.message)
      let resp
      if (e.code === RATE_LIMIT_ERROR_CODE) {
        await new Promise(resolve => setTimeout(resolve, e.data.timeToNextCall))
        resp = await send()
      } else {
        // TODO: Figure out when to retry
        resp = await send(true)
      }
      return resp
    })
}

export default sendRequest
