import React, { useState, memo } from 'react'
import { Flex } from '@rebass/emotion'
import Onboarding from 'components/Onboarding'
import { OverrideAppHeight } from 'components/Utils'
import Header from './Header'
import ConnectedInterfaces from './ConnectedInterfaces'
import ProxyControls from './ProxyControls'
import DomainDetails from './DomainDetails'
import UsageBar from './UsageBar/index'
import { useConnect } from 'ui/hooks'
import { ACCOUNT_PLAN } from 'utils/constants'

export default memo(() => {
  const [currentInterface, setInterface] = useState('browser')
  const [hoveringOnInterface, setHoveringOnInterface] = useState(false)
  const { is_premium, traffic_max } = useConnect(s => s.session)

  const hideUsageBar = is_premium || traffic_max === ACCOUNT_PLAN.UNLIMITED

  return (
    <Flex flexDirection="column">
      <OverrideAppHeight height={'0px'} />
      <Onboarding />
      <Header currentInterface={currentInterface} />
      <ConnectedInterfaces
        currentInterface={currentInterface}
        setInterface={setInterface}
        hoveringOnInterface={hoveringOnInterface}
        setHoveringOnInterface={setHoveringOnInterface}
      />
      <ProxyControls
        hoveringOnInterface={hoveringOnInterface}
        currentInterface={currentInterface}
        setInterface={setInterface}
      />
      <DomainDetails />
      {!hideUsageBar && <UsageBar />}
    </Flex>
  )
})
