import React, { useEffect } from 'react'
import { Global, css } from '@emotion/core'
import emotionNormalize from 'emotion-normalize'
import { differenceInDays, differenceInHours } from 'date-fns'
import { createSelector } from 'reselect'
import { useSelector } from 'react-redux'
import { THEME_MAP } from 'utils/constants'
import { actions } from 'state/dux'
import { ThemeProvider } from 'emotion-theming'
import Router from 'Router'

// why is *this* called App and not Init

const selector = createSelector(
  s => s?.theme,
  (...args) => args,
)

const ACTIVITY = 'open_popup--store_loaded'

const checkSession = ({ store }) => {
  const { session } = store.getState()
  if (!session.session_auth_hash) {
    return false
  }
  store.dispatch(actions.session.get())
  return true
}

const clearLogsOlderThanWeek = ({ store }) => {
  const { lastDebugLogCheck } = store.getState()

  const diffDays = differenceInDays(Date.now(), lastDebugLogCheck)

  if (!lastDebugLogCheck || diffDays >= 7) {
    store.dispatch(
      actions.debugLog.clearweeklongentries({ logActivity: ACTIVITY }),
    )
    store.dispatch(actions.lastDebugLogCheck.set(Date.now()))
  }
}

const fetchBlockListAndBestLocationAfterDay = ({ store }) => {
  const { lastBlockListCheck } = store.getState()

  const diffDays = differenceInDays(Date.now(), lastBlockListCheck)

  if (!lastBlockListCheck || diffDays >= 1) {
    store.dispatch(actions.ublock.fetchblocklists({ logActivity: ACTIVITY }))
    store.dispatch(actions.bestLocation.fetch())
  }
}

const fetchNewsFeedAfterHalfDay = ({ store }) => {
  const { lastNewsfeedCheck } = store.getState()

  const diffHours = differenceInHours(Date.now(), lastNewsfeedCheck)

  if (!lastNewsfeedCheck || diffHours >= 12) {
    store.dispatch(
      actions.newsfeedItems.fetch({ logActivity: ACTIVITY, checkPopup: true }),
    )
    store.dispatch(actions.lastNewsfeedCheck.set(Date.now()))
  }
}

export default ({ store }) => {
  const [themeName] = useSelector(selector)
  const { theme } = THEME_MAP.get(themeName)

  // TODO: investigate this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // TODO: use useConnect
    if (checkSession({ store })) {
      clearLogsOlderThanWeek({ store })
      fetchBlockListAndBestLocationAfterDay({ store })
      fetchNewsFeedAfterHalfDay({ store })

      const { showNewsfeed } = store.getState()
      if (showNewsfeed) {
        store.dispatch(actions.view.set('Newsfeed'))
      }

      // 2020-09-28: #55 removing call to check wsappconrol as the same call happens in ProxyControls/Desktop.js line 133

      // each popup open, see if you snoozed rating or if it has been more than alloted time since install to show popup AND
      // usage > 2gb
      // if so, you will see the rate us popup
      store.dispatch(actions.showRateUs.set(true))
    }
    // TODO: investigate this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          ${emotionNormalize};
          * {
            user-select: none;
            outline: none;
            box-sizing: border-box;
          }
          body {
            background-color: black;
          }
          #app-frame > div {
            overflow: hidden;
            height: 100%;
            position: relative;
          }
        `}
      />
      <Router />
    </ThemeProvider>
  )
}
