import qs from 'query-string'
import { ApiCall, ApiRequest, ActionCreator, ApiException } from './commonTypes'
import getMandatoryParams from './getMandatoryParams'
import { getConfig } from './config'
import dispatcher from './dispatcher'
import sendRequest from './sendRequest'

const createSessionErrorAndDispatchAction = (actionCreator: ActionCreator) => {
  const err = {
    code: 1337,
    message: 'No session auth hash in API',
  } as ApiException
  if (actionCreator) {
    dispatcher({ actionCreator, data: err })
  }
  return err
}
//#region Parse response
interface ParseResponseArgs {
  response: Response
  debug?: Record<string, unknown>
}
const parseResponse = async ({ response, debug = null }: ParseResponseArgs) => {
  let resData
  // handle different response types
  if (response.status >= 500) {
    throw {
      code: response.status,
      message: response.statusText,
      debug,
      data: debug,
    } as ApiException
  } else if (
    response.headers.get('content-type') === 'application/x-ns-proxy-autoconfig'
  ) {
    resData = await response.text()
    // handle plain text response errors
    if (resData.length === 0) {
      // empty response from API
      throw {
        code: 500,
        message: 'Empty response from API',
        debug,
        data: debug,
      } as ApiException
    }
  } else {
    resData = await response.json()
    // handle json response errors
    if (Object.keys(resData).length === 0) {
      let errCode = 0
      if (response.status > 0) {
        errCode = response.status
      }
      // empty response from API
      throw {
        code: errCode,
        message: 'Empty response from API',
        debug,
        data: debug,
      } as ApiException
    } else if (resData.errorCode || !resData.data) {
      // error in API response
      const errorCode = resData.errorCode || 'No error code present'
      const errorMsg = resData.errorMessage || 'No error message present'
      throw {
        code: errorCode,
        message: errorMsg,
        debug,
        data: JSON.stringify(resData),
      } as ApiException
    }
  }
  return resData
}
//#endregion

const request: ApiRequest = async ({
  method,
  endpoint,
  opts = {},
  debugOpts = {},
  actionCreators: {
    successfulReduxAction,
    failedReduxAction,
    loadingReduxAction,
  },
  assets = false,
}) => {
  try {
    if (loadingReduxAction) {
      dispatcher({ getConfig, actionCreator: loadingReduxAction })
    }
    const response = await sendRequest({
      endpoint,
      debugOpts,
      opts,
      method,
      assets,
      actionCreators: {},
    })
    /* check for errors in the response body */
    const data = await parseResponse({
      response,
      debug: {
        response,
        debugOpts,
        endpoint,
        url: global.url,
      },
    })
    if (successfulReduxAction) {
      dispatcher({ actionCreator: successfulReduxAction, data })
    }
    return data
  } catch (e) {
    // make sure code is always available for consistency
    e.code = e.code || 0
    if (failedReduxAction) {
      dispatcher({ actionCreator: failedReduxAction, data: e })
    } else {
      throw e
    }
  }
}

//#region Http verb calls

const get: ApiCall = async ({ endpoint, params, actionCreators = {} }) => {
  const { sessionAuthHash } = getConfig()

  if (!sessionAuthHash) {
    throw createSessionErrorAndDispatchAction(actionCreators.failedReduxAction)
  }
  const data = await request({
    method: 'get',
    endpoint,
    opts: { params: { ...params, ...getMandatoryParams(sessionAuthHash) } },
    actionCreators,
  })
  return data
}
const post: ApiCall = async ({
  endpoint,
  params: requestParams,
  actionCreators = {},
}) => {
  const { sessionAuthHash } = getConfig()

  const params = {
    ...requestParams,
    ...getMandatoryParams(sessionAuthHash),
  }

  const body = qs.stringify(params)

  const opts = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  }
  const data = await request({
    method: 'post',
    endpoint,
    opts,
    debugOpts: { ...opts },
    actionCreators,
  })
  return data
}
const put: ApiCall = async ({
  endpoint,
  params: requestParams,
  actionCreators = {},
}) => {
  const { sessionAuthHash } = getConfig()
  if (!sessionAuthHash) {
    throw createSessionErrorAndDispatchAction(actionCreators.failedReduxAction)
  }
  const params = {
    ...requestParams,
    ...getMandatoryParams(sessionAuthHash),
  }

  const body = qs.stringify(params)

  const opts = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  }

  const data = await request({
    method: 'put',
    endpoint,
    opts,
    actionCreators,
  })
  return data
}
const del: ApiCall = async ({ endpoint, params, actionCreators = {} }) => {
  const { sessionAuthHash } = getConfig()
  if (!sessionAuthHash) {
    throw createSessionErrorAndDispatchAction(actionCreators.failedReduxAction)
  }
  const data = await request({
    method: 'delete',
    endpoint,
    opts: {
      params: {
        ...params,
        ...getMandatoryParams(sessionAuthHash),
      },
    },
    actionCreators,
  })
  return data
}
//#endregion

export { get, put, post, del, request }
