import React, { memo } from 'react'
import { Flex } from '@rebass/emotion'
import Onboarding from 'components/Onboarding'
import { OverrideAppHeight } from 'components/Utils'
import Header from './Header'
import ProxyControls from './ProxyControls'
import DomainDetails from './DomainDetails'
import UsageBar from './UsageBar/index'
import { useConnect } from 'ui/hooks'
import { ACCOUNT_PLAN } from 'utils/constants'

export default memo(() => {
  const { is_premium, traffic_max } = useConnect(s => s.session)

  const hideUsageBar = is_premium || traffic_max === ACCOUNT_PLAN.UNLIMITED

  return (
    <Flex flexDirection="column">
      <OverrideAppHeight height={'0px'} />
      <Onboarding />
      <Header />
      <ProxyControls />
      <DomainDetails />
      {!hideUsageBar && <UsageBar />}
    </Flex>
  )
})
