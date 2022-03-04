import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import AccountOverlay from 'components/AccountOverlay'
import { actions } from 'state'

export default () => {
  const dispatch = useDispatch()
  const goToMain = useCallback(async () => dispatch(actions.view.set('Main')), [
    dispatch,
  ])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startOnboarding = useCallback(() =>
    dispatch(actions.showOnboarding.set(true), []),
  )

  return (
    <AccountOverlay
      status="welcome"
      close={goToMain}
      startOnboarding={startOnboarding}
    />
  )
}
