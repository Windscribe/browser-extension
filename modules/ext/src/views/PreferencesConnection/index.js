import React, { useState } from 'react'
import { useDispatch, useConnect } from 'ui/hooks'
import { createSelector } from 'reselect'
import { actions } from 'state'
import DropDown from '../Preferences/DropDown'
import Menu from '../Preferences/Menu'
import SettingItem from '../Preferences/SettingItem'
import ToggleSwitch from '../Preferences/ToggleSwitch'
import AutoConnectIcon from 'assets/settingIcons/autoConnect.svg'
import SmokewallIcon from 'assets/settingIcons/smokewall.svg'
import FailoverIcon from 'assets/settingIcons/failover.svg'
import ProxyPortIcon from 'assets/settingIcons/proxyPort.svg'

const ACTIVITY = 'preferences_connection'

const settingsSelector = createSelector(
  s => s.autoConnect,
  s => s.proxyPort,
  s => s.smokewall,
  s => s.failover,
  (...settings) => settings,
)
export default () => {
  const dispatch = useDispatch()
  const [autoConnect, proxyPort, smokewall, failover] = useConnect(
    settingsSelector,
  )

  const [showReloadAlert, setReloadAlert] = useState(false)

  return (
    <Menu
      title="Connection"
      showReloadAlert={showReloadAlert}
      setReloadAlert={setReloadAlert}
    >
      <SettingItem
        title={'Auto-Connect'}
        subHeading={'Automatically connect on browser start.'}
        Icon={AutoConnectIcon}
      >
        <ToggleSwitch
          type={'Auto-Connect'}
          toggleValue={autoConnect}
          onToggle={() => {
            dispatch(
              actions.autoConnect.setandlog({
                value: !autoConnect,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Smokewall'}
        subHeading={'Do not disconnect even on proxy failure.'}
        Icon={SmokewallIcon}
      >
        <ToggleSwitch
          type={'Smokewall'}
          toggleValue={smokewall}
          onToggle={() => {
            dispatch(
              actions.smokewall.setandlog({
                value: !smokewall,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Failover'}
        subHeading="On proxy failure, auto switch locations."
        Icon={FailoverIcon}
      >
        <DropDown
          type={'failover'}
          current={failover}
          items={['Auto / Best', 'Same Country', 'None']}
          ACTIVITY={ACTIVITY}
        />
      </SettingItem>
      <SettingItem
        title={'Proxy Port'}
        subHeading={'Select which port to connect with.'}
        noBorder
        Icon={ProxyPortIcon}
      >
        <DropDown
          type={'proxyPort'}
          current={proxyPort}
          items={['443', '9443']}
          ACTIVITY={ACTIVITY}
        />
      </SettingItem>
    </Menu>
  )
}
