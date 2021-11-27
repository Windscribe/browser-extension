import {
  ApiInterface,
  EndpointApi,
  ActionCreators,
  BooleanNumber,
} from '../api/commonTypes'
import getMandatoryParams from '../api/getMandatoryParams'

const endpoint = '/RegToken'

interface Token {
  id: string
  token: string
  signature: string
  time: number
}

export default (
  api: ApiInterface<Token>,
): { getToken: EndpointApi<ActionCreators, Token> } => ({
  async getToken({
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  } = {}) {
    const { time, client_auth_hash } = getMandatoryParams()
    const opts: Record<string, any> = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        time,
        client_auth_hash,
      }),
    }
    /**
     * The abuse prevention algo uses the user-agent to track a specific user. For development
     * purposes we needed to get round this. Introduced the WEB_EXT_SPOOF_USER_AGENT key in the
     * env file which would allow the user agent to be set programmatically to either trigger
     * the ban or bypass it.
     *
     * This only works on Firefox as Chrome does not allow the user agent to be set in the
     * request. https://bugs.chromium.org/p/chromium/issues/detail?id=571722
     */
    if (process.env.NODE_ENV === 'development') {
      if (process.env.WEB_EXT_SPOOF_USER_AGENT === 'true') {
        opts.headers = { ...opts.headers, 'User-Agent': Date.now().toString() }
      } else {
        opts.headers = { ...opts.headers, 'User-Agent': 'getting banned' }
      }
    }
    const resp = await api.request({
      method: 'POST',
      endpoint,
      opts,
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data
  },
})
