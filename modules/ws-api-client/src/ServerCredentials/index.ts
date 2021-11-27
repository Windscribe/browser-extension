import { ApiInterface, EndpointApi, ActionCreators } from '../api/commonTypes'

const endpoint = '/ServerCredentials'

interface Credential {
  username: string
  password: string
}
export default (
  api: ApiInterface<Credential>,
): { get: EndpointApi<ActionCreators, Credential> } => ({
  /**
   * GET ServerCredentials
   * @param {Function} successfulReduxAction Optional, A redux action creator on successful request
   * @param {Function} failedReduxAction Optional, A redux action creator on failed request
   * @param {Function} loadingReduxAction Optional, A redux action creator on request start
   */
  async get({
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  } = {}) {
    const data = await api.get({
      endpoint,
      params: {},
      actionCreators: { failedReduxAction, loadingReduxAction },
    })
    const response = {
      username: window.atob(data.data.username),
      password: window.atob(data.data.password),
    }
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: response,
        ...api,
      })
    }
    return response
  },
})
