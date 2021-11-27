import React from 'react'
import { useDispatch } from 'react-redux'
import AccountOverlay from 'components/AccountOverlay'
import { actions } from 'state'
import websiteLink from 'utils/websiteLink'

export default () => {
  const dispatch = useDispatch()
  const goBack = () => dispatch(actions.view.back())
  const goToAccount = () => {
    goBack()
    websiteLink({ path: 'myaccount' })
  }

  return (
    <AccountOverlay
      status="ghostAddEmail"
      close={goBack}
      goToAccount={goToAccount}
    />
  )
}

export const GhostAddEmailPro = () => {
  const dispatch = useDispatch()
  const goBack = () => dispatch(actions.view.back())
  const goToAccount = () => {
    goBack()
    websiteLink({ path: 'myaccount' })
  }

  return (
    <AccountOverlay
      status="ghostAddEmailPro"
      close={goBack}
      goToAccount={goToAccount}
    />
  )
}
