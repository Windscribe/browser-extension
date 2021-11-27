import React from 'react'
import { useTranslation } from 'react-i18next'
import pushToDebugLog from 'utils/debugLogger'
import CriticalError from 'views/CriticalError'

export default props => {
  const { t } = useTranslation()
  pushToDebugLog({
    tag: 'popup',
    level: 'ERROR',
    activity: props.ACTIVITY,
    message: `User has “never remember history” on Firefox enabled`,
  })
  return (
    <CriticalError
      noReload
      alert={t(
        'You have "never remember history" enabled, disable it to have your settings saved',
      )}
      {...props}
    />
  )
}
