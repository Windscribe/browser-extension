import React, { useCallback, useState } from 'react'
import AccountOverlay from 'components/AccountOverlay'
import { actions } from 'state/dux'
import { useDispatch, useConnect } from 'ui/hooks'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.blockListsEnabled,
  s => s.ublockAsked,
  (...args) => args,
)

const ACTIVITY = 'preferences_privacy'

export default () => {
  const [uninstallView, setUninstallView] = useState(false)

  const [blockListsEnabled, ublockAsked] = useConnect(selector)
  const dispatch = useDispatch()
  const useUblock = useCallback(() => {
    blockListsEnabled.forEach(item =>
      dispatch(
        actions.blockListsEnabled.toggle({
          listItem: item,
          logActivity: ACTIVITY,
        }),
      ),
    )
    if (ublockAsked) {
      dispatch(actions.view.back())
    } else {
      dispatch(actions.view.set('Welcome'))
      dispatch(actions.ublockEnabled.set(true))
      dispatch(actions.ublockAsked.set(true))
    }
  }, [blockListsEnabled, dispatch, ublockAsked])

  const useWSAdblock = useCallback(() => {
    dispatch(actions.ublockEnabled.set(false))

    if (ublockAsked) {
      dispatch(actions.view.back())
    } else {
      dispatch(actions.view.set('Welcome'))
      dispatch(actions.ublockAsked.set(true))
    }
  }, [dispatch, ublockAsked])

  return (
    <>
      {uninstallView ? (
        <AccountOverlay status="UninstallUblock" useWSAdblock={useWSAdblock} />
      ) : (
        <AccountOverlay
          status="UblockDetected"
          setUninstallView={setUninstallView}
          useUblock={useUblock}
        />
      )}
    </>
  )
}
