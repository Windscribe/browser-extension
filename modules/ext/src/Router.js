import React from 'react'
import { useConnect } from 'ui/hooks'
import { useLogger } from 'utils/extHooks'
import Error from 'components/Error'
import * as Views from 'views'

export default () => {
  const currentView = useConnect(s => s?.view?.current) || 'Main'
  useLogger(
    {
      tag: 'popup',
      level: 'INFO',
      activity: 'router_navigation',
      message: `Switched view to ${currentView}`,
    },
    [currentView],
  )

  const C = Views[currentView]

  return C ? <C /> : <Error />
}
