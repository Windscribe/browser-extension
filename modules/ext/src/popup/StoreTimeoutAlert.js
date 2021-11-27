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
    message: `Background store timed out, could not establish a connection`,
  })
  return (
    <CriticalError
      alert={t('Background store timed out, could not establish a connection')}
      {...props}
    />
  )
}
