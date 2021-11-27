import React from 'react'
import LoadingScreen from 'components/LoadingScreen'
import { OverrideAppHeight } from 'components/Utils'

export default () => {
  return (
    <>
      <OverrideAppHeight height={'300px'} />
      <LoadingScreen />
    </>
  )
}
