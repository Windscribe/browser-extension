import React from 'react'
import { useDispatch, useConnect } from 'ui/hooks'
import { actions } from 'state'
import AccountOverlay from 'components/AccountOverlay'

const ACTIVITY = 'preferences_privacy'

export default () => {
  const dispatch = useDispatch()
  const advancedModeEnabled = useConnect(s => s.advancedModeEnabled)
  const goBack = () => dispatch(actions.view.back())
  const toggleAdvancedMode = () => {
    if (advancedModeEnabled) {
      dispatch(
        actions.advancedModeEnabled.setandlog({
          value: false,
          logActivity: ACTIVITY,
        }),
      )
      dispatch(actions.ublock.disableadvancedmode())
    } else {
      dispatch(
        actions.advancedModeEnabled.setandlog({
          value: true,
          logActivity: ACTIVITY,
        }),
      )
    }
    goBack()
  }

  return (
    <AccountOverlay
      status="confirmAdvancedMode"
      close={goBack}
      toggleAdvancedMode={toggleAdvancedMode}
    />
  )
}
