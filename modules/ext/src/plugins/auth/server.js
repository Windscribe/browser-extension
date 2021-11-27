import fetchServerList from 'utils/fetchServerList'
import pushToDebugLog from 'utils/debugLogger'
import api from 'api'

export default actions => [
  {
    type: actions.auth.getserverlist,
    latest: true,
    async process({ getState, action }, dispatch, done) {
      const { logActivity = null } = action?.payload || {}
      pushToDebugLog({
        activity: logActivity,
        message: `Fetching server list`,
      })
      dispatch(actions.serverList.fetch())

      try {
        const serverList = await fetchServerList(getState().session)
        dispatch(actions.serverList.fetchSuccess(serverList))
        pushToDebugLog({
          activity: logActivity,
          message: `Successfully fetched server list. Loc hash: ${serverList?.info?.revision_hash}`,
        })
      } catch (error) {
        dispatch(actions.serverList.fetchFailure(error))
        pushToDebugLog({
          activity: logActivity,
          level: 'ERROR',
          message: `Error while fetching server list: ${JSON.stringify(error)}`,
        })
      }
      done()
    },
  },
  {
    type: actions.auth.getservercreds,
    latest: true,
    // this is to limit calls from authHandler
    throttle: 3000,
    async process({ action }, dispatch, done) {
      const { logActivity = null } = action?.payload || {}
      dispatch(actions.serverCredentials.fetch({ logActivity }))
      try {
        const serverCredentials = await api.serverCredentials.get()
        global.serverCredentials = serverCredentials
        dispatch(actions.serverCredentials.fetchSuccess(serverCredentials))
        pushToDebugLog({
          activity: logActivity,
          message: `Successfully got server creds: username ${serverCredentials.username}`,
        })
      } catch (error) {
        pushToDebugLog({
          activity: logActivity,
          message: `Error while trying to get server creds: ${error.message}`,
        })
        // notifications can cause infinite notification loop, causing subsequent crash
        // removed since on auth required will deactivate if needed.
        // dispatch(actions.proxy.deactivate({ notification: false, logActivity }))
        dispatch(actions.serverCredentials.fetchFailure(error))
      }
      done()
    },
  },
]
