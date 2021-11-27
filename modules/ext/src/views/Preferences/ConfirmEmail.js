import { useState } from 'react'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'

export default ({ children, ...props }) => {
  const dispatch = useDispatch()

  const [confirmationSent, setConfirmation] = useState(false)

  const resendConfirmation = () =>
    dispatch(actions.emailConfirmation.resend({ logActivity: 'confirm_email' }))

  return children({
    ...props,
    confirmationSent: confirmationSent,
    resendConfirmation: () => {
      resendConfirmation()
      setConfirmation(!confirmationSent)
    },
  })
}
