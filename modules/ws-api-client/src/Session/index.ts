import {
  ApiInterface,
  EndpointApi,
  ActionCreators,
  BooleanNumber,
  SessionType,
} from '../api/commonTypes'

const endpoint = '/Session'

interface SessionData {
  session_auth_hash: string
  username: string
  user_id: string
  traffic_used: number
  traffic_max: number
  status: BooleanNumber
  email?: string
  email_status: BooleanNumber
  billing_plan_id: number
  is_premium: BooleanNumber
  reg_date: number
  loc_rev: number
  loc_hash: string
}

interface LoginParams extends ActionCreators {
  username: string
  password: string
  sessionType: SessionType
  twoFACode?: string
}

interface GetParams extends ActionCreators {
  params?: Record<string, unknown>
}
export default (
  api: ApiInterface<SessionData>,
): {
  get: EndpointApi<GetParams, SessionData>
  login: EndpointApi<LoginParams, SessionData>
} => ({
  async login({
    username,
    password,
    sessionType,
    twoFACode,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const { body, protectedBody } = await api.prepLoginForm({
      username,
      password,
      /**
       *  For testing purposes, supply session_type_id=1 instead of 2
       *  on the login request to trigger 2FA (if enabled).
       *  This needs to be set back to 2 for actual release.
       */
      sessionType:
        process.env.WEB_EXT_ENABLE_2FA_TESTING === 'true' ? 1 : sessionType,
      twoFACode,
    })
    const opts = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
    const data = await api.request({
      method: 'post',
      endpoint,
      opts,
      debugOpts: { protectedBody },
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: data.data,
      })
    }
    return data.data
  },
  /**
   * GET Session
   * @param {Object} params Optional, GET parameters to pass in request
   * @param {Function} successfulReduxAction Optional, A redux action creator on successful request
   * @param {Function} failedReduxAction Optional, A redux action creator on failed request
   * @param {Function} loadingReduxAction Optional, A redux action creator on request start
   */
  async get({
    params = {},
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  } = {}) {
    const data = await api.get({
      endpoint,
      params,
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: data.data,
      })
    }
    return data.data
  },
})
