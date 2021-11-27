import {
  ApiInterface,
  EndpointApi,
  ActionCreators,
  BooleanNumber,
} from '../api/commonTypes'

const endpoint = '/Notifications'

interface Notification {
  id: number
  title: string
  message: string
  date: number
  perm_free: BooleanNumber
  perm_pro: BooleanNumber
}

interface Notifications {
  notifications: Notification[]
}
export default (
  api: ApiInterface<Notifications>,
): { get: EndpointApi<ActionCreators, Notifications> } => ({
  async get({
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  } = {}) {
    const data = await api.get({
      endpoint,
      params: {},
      actionCreators: {
        successfulReduxAction,
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: data.data,
        ...api,
      })
    }

    return data.data
  },
})
