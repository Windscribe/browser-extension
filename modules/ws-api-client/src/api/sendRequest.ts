import qs from 'query-string'
import { RequestArgs, ApiException } from './commonTypes'
import { getConfig, setConfig } from './config'

interface PrepareValidUrlArgs {
  apiDomain: string
  url: string
  assets?: boolean
  useBackup?: boolean
  useDoh?: boolean
}

const fetchDoh = async () => {
  const res = await fetch(
    'https://1.1.1.1/dns-query?name=dynamic-api-host.windscribe.com&type=TXT',
    {
      method: 'GET',
      headers: {
        Accept: 'application/dns-json',
      },
    },
  )
  const data = await res.json()

  return data.Answer[0].data.slice(1, -1)
}

const prepareValidUrl = async ({
  apiDomain,
  url,
  assets = false,
}: PrepareValidUrlArgs) => {
  const urlValidator = new RegExp(/^http|ftp|file:\/\//gim)
  // If it's a full url send use it as is
  if (urlValidator.test(url)) {
    return url
  }
  let baseUrl

  baseUrl = assets ? `https://assets${apiDomain}` : `https://api${apiDomain}`

  // If it's a base endpoint without a / starting add it
  if (!urlValidator.test(url) && !url.startsWith('/')) {
    return `${baseUrl}/${url}`
    // If the endpoint has the slash return it with the base url
  } else if (!urlValidator.test(url) && url.startsWith('/')) {
    return baseUrl + url
  }
}

const sendRequest = async ({
  endpoint,
  debugOpts = {},
  opts = {},
  method = 'get',
  assets = false,
}: RequestArgs): Promise<Response> => {
  const RATE_LIMIT_ERROR_CODE = 7331
  /* Sets the url, if there's params it'll construct and append the params to the url */
  const params = { ...opts.params, platform: getConfig().platform }
  /*
      Sets up the config.
      if there's a key named method just pass the options object.
      if not, use the method argument.
    */
  const config = opts.method ? opts : { ...opts, method }

  const send = async (apiDomain, useBackup = false) => {
    const { lastCallTimeStamps = {}, apiCallMinInterval } = getConfig()

    const apiUrl = await prepareValidUrl({
      apiDomain,
      url: endpoint,
      assets,
    })

    if (!apiUrl) return null

    const url = apiUrl + `?${qs.stringify(params)}`

    const debugUrl = apiUrl
    global.url = debugUrl

    const timeToNextCall =
      Number(apiCallMinInterval) -
      (Date.now() - lastCallTimeStamps[endpoint] ?? 0)
    if (timeToNextCall > 0 && !useBackup) {
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

      const controller = new AbortController()

      setTimeout(() => controller.abort(), 3000)
      const request: RequestInit = {
        headers: config.headers as HeadersInit,
        method: config.method,
        body: config.body,
        signal: controller.signal,
      }

      const response = await fetch(url, request)

      let { workingApi } = getConfig()
      if (!workingApi) {
        setConfig({
          workingApi: apiDomain,
        })
      }

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

  const { apiUrl, backupApiUrl, workingApi } = getConfig()

  const apiDomain = apiUrl.split('api')[1]
  const backupApiDomain = backupApiUrl.split('api')[1]

  /* Make the request */
  try {
    const resp = await send(workingApi || apiDomain)
    return resp
  } catch (e) {
    console.error(e.message)
    let resp
    if (e.code === RATE_LIMIT_ERROR_CODE) {
      await new Promise(resolve => setTimeout(resolve, e.data.timeToNextCall))
      resp = await send(workingApi || apiDomain)
    } else {
      try {
        setConfig({
          workingApi: null,
        })
        resp = await send(backupApiDomain, true)

        return resp
      } catch {
        try {
          setConfig({
            workingApi: null,
          })
          const dohUrl = await fetchDoh()
          resp = await send(`.${dohUrl}`, true)

          return resp
        } catch {
          return null
        }
      }
    }
    return resp
  }
}

export default sendRequest
