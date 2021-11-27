import React from 'react'
import AccountOverlay from 'components/AccountOverlay'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'

export default () => {
  const dispatch = useDispatch()
  const goToSignUp = () => {
    goBack()
    dispatch(actions.view.set('Signup'))
  }
  const goBack = () => dispatch(actions.view.back())
  return (
    <AccountOverlay
      status="ghostNotAllowed"
      close={goBack}
      goToSignUp={goToSignUp}
    />
  )
}
