import React from 'react'
import { useDispatch } from 'react-redux'
import AccountOverlay from 'components/AccountOverlay'
import { actions } from 'state'

export default () => {
  const dispatch = useDispatch()
  const goBack = () => dispatch(actions.view.back())
  const goToSignUp = () => {
    goBack()
    dispatch(actions.view.set('Signup'))
  }

  return (
    <AccountOverlay
      status="ghostNoData"
      close={goBack}
      goToSignUp={goToSignUp}
    />
  )
}
