import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AccountOverlay from 'components/AccountOverlay'
import { actions } from 'state'

export default () => {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector(s => s.session?.session_auth_hash)
  const goToMain = useCallback(
    () => dispatch(actions.view.set(isLoggedIn ? 'Main' : 'Login')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return <AccountOverlay status="ffPrivateMode" close={goToMain} />
}
