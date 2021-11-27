import urlJoin from 'url-join'
import {
  ApiInterface,
  EndpointApi,
  ActionCreators,
  ApiResponse,
} from '../api/commonTypes'

interface PostParams extends ActionCreators {
  type: 'app' | 'ext' | 'mobile'
  os: string
}

interface Result {
  success: 1 | 0
  type: 'app' | 'ext' | 'mobile'
  os: string
}
export default (
  api: ApiInterface<Result>,
): { post: EndpointApi<PostParams, Result> } => ({
  /**
   * POST /RecordInstall
   * @param {String} type Type of install: [app, ext, mobile]
   * @param {String} os Operating system or Browser
   * @param {Function} successfulReduxAction Optional, A redux action creator on successful request
   * @param {Function} failedReduxAction Optional, A redux action creator on failed request
   * @param {Function} loadingReduxAction Optional, A redux action creator on request start
   */
  async post({
    type,
    os,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const data = await api.post({
      endpoint: urlJoin('RecordInstall', type, os),
      params: {},
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: data.data,
        getConfig: api.getConfig,
      })
    }
    return data.data
  },
})
