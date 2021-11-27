import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import AccountOverlay from 'components/AccountOverlay'
import { actions } from 'state'

export default () => {
  const dispatch = useDispatch()
  const reject = useCallback(() => {
    dispatch(actions.neverRateAgain.set(true))
    dispatch(actions.view.set('Main'))
  }, [dispatch])
  return (
    <AccountOverlay
      status="rateUs"
      close={reject}
      reject={reject}
      rejectText={'No Thanks'}
    />
  )
}
