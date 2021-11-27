import { ApiInterface, EndpointApi } from '../../api/commonTypes'

const endpoint = '/AdminSession'

export default (api: ApiInterface): { login: EndpointApi } => ({
  async login({
    username,
    password,
    sessionType,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  } = {}) {
    const { body } = await api.prepLoginForm({
      username,
      password,
      sessionType,
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
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: data.data as Record<string, unknown>,
      })
    }
    return data.data as Record<string, unknown>
  },
})
