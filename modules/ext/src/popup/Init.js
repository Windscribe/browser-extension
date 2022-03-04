import React, { useState, useEffect, Suspense } from 'react'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'
import LoadingScreen from 'components/LoadingScreen'
import { RENDER_TIMEOUT } from 'utils/constants'
import StoreTimeoutAlert from './StoreTimeoutAlert'
import App from './App'
import { OverrideAppHeight } from 'components/Utils'

const ACTIVITY = 'open_popup'

let renderTimer

export default ({ popupHeight = '300px', store }) => {
  const [shouldRender, setShouldRender] = useState(false)
  const [showTimeoutError, setShowTimeoutError] = useState(false)
  const dispatch = useDispatch()

  const stopRenderTimer = () => {
    clearTimeout(renderTimer)
    renderTimer = undefined
  }

  useEffect(() => {
    const { session } = store.getState()
    if (session && session.session_auth_hash) {
      dispatch(actions.view.set('Main'))
    }

    const isReadyInterval = setInterval(() => {
      const { bgReady } = store.getState()
      if (bgReady) {
        stopRenderTimer()
        clearInterval(isReadyInterval)
        setShouldRender(true)
      }
    }, 50)

    renderTimer = setTimeout(() => {
      clearInterval(isReadyInterval)
      setShowTimeoutError(true)
      setShouldRender(false)
    }, RENDER_TIMEOUT)

    store.ready().catch(e => {
      stopRenderTimer()
      setShouldRender(false)
      throw new Error(e)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <OverrideAppHeight height={popupHeight} />
      {showTimeoutError && <StoreTimeoutAlert ACTIVITY={ACTIVITY} />}
      {shouldRender && (
        <Suspense fallback={<LoadingScreen />}>
          <App popupHeight={popupHeight} store={store} />
        </Suspense>
      )}
      {!shouldRender && !showTimeoutError && <LoadingScreen />}
    </>
  )
}
