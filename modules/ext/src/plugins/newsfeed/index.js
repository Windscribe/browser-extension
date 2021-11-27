import api from 'api'
import { store, actions } from 'state'

import pushToDebugLog from 'utils/debugLogger'
export default {
  lexiconEntries: [
    {
      name: 'newsfeedItems',
    },
    {
      name: 'newsfeedIdsAlreadyViewed',
      initialState: [], //an array of viewed newsFeed Id's (numbers)
      stashOnLogout: true,
    },
    {
      name: 'lastNewsfeedCheck',
    },
    {
      name: 'showNewsfeed',
      initialState: false,
    },
  ],
  initialize() {
    if (store.getState().session.session_auth_hash) {
      //TODO: store dispatch does not accept params, they come back as undefined. Here the activity will just show up as the default set for `newsfeedItems.fetch`
      store.dispatch(
        actions.newsfeedItems.fetch({
          logActivity: 'newsfeed_init',
          checkPopup: true,
        }),
      )
    }
  },
  logic: actions => [
    {
      type: actions.newsfeedItems.fetch,
      latest: true,
      async process({ getState, action }, dispatch, done) {
        const { logActivity, checkPopup } = action?.payload || {}
        try {
          const { data } = await api.get({
            endpoint: '/Notifications',
            params: { platform: api.getConfig().platform },
          })
          dispatch(actions.newsfeedItems.fetchSuccess(data))
          dispatch(actions.lastNewsfeedCheck.set(Date.now()))
          pushToDebugLog({
            activity: logActivity,
            message: 'Successfully fetched newsfeed',
          })
          // we need to force show feed in items have popup key in them
          if (checkPopup) {
            const { newsfeedIdsAlreadyViewed, firstInstallDate } = getState()
            const { notifications } = data
            // acrue newsfeed items that have a "popup" key and have not been viewed
            const popUpItems = notifications.filter(
              item =>
                item?.popup && !newsfeedIdsAlreadyViewed?.includes(item.id),
            )
            const cutoff = (Math.floor(Date.now() / 1000) - 300) * 1000
            if (popUpItems.length > 0 && firstInstallDate < cutoff) {
              // we have items that need to be viewed, show newsfeed
              dispatch(actions.showNewsfeed.set(true))
            }
          }
        } catch (err) {
          dispatch(actions.newsfeedItems.fetchFailure(err))
          pushToDebugLog({
            activity: logActivity,
            level: 'ERROR',
            message: `Error while trying to fetch newsfeed: ${err.message}`,
          })
        }
        done()
      },
    },
    {
      type: actions.newsfeedIdsAlreadyViewed.push,
      latest: true,
      async process({ getState, action }, dispatch, done) {
        const idToAdd = action.payload
        if (!getState().newsfeedIdsAlreadyViewed.includes(idToAdd)) {
          dispatch(actions.newsfeedIdsAlreadyViewed.concat(idToAdd))
        }
        done()
      },
    },
  ],
}
