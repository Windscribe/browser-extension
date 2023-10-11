import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useConnect } from 'ui/hooks'
import { Flex, Text } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { openDebugLogView } from 'utils/debugLogger'
import { createSelector } from 'reselect'
import { actions } from 'state'
import websiteLink from 'utils/websiteLink'
import Menu from '../Preferences/Menu'
import SettingItem from '../Preferences/SettingItem'
import SettingLink from '../Preferences/SettingLink'
import ToggleSwitch from '../Preferences/ToggleSwitch'
import NotificationsIcon from 'assets/settingIcons/notifications.svg'
import ShowLocationLoadIcon from 'assets/settingIcons/showLocationLoad.svg'
import DebugMenuIcon from 'assets/settingIcons/debugMenu.svg'
import DebugLogIcon from 'assets/settingIcons/debugLog.svg'
import KebabMenuIcon from 'assets/kebabMenu.svg'

const ACTIVITY = 'preferences_general'

const settingsSelector = createSelector(
  s => s.allowSystemNotifications,
  s => s.showDebugContextMenu,
  s => s.locationLoadEnabled,
  (...settings) => settings,
)
export default () => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const [
    allowSystemNotifications,
    showDebugContextMenu,
    locationLoadEnabled,
  ] = useConnect(settingsSelector)

  const sendDebugLog = () =>
    dispatch(actions.debugLog.send({ logActivity: ACTIVITY }))

  const [debugLogSent, setDebugLogSent] = useState(false)
  const [showReloadAlert, setReloadAlert] = useState(false)

  return (
    <Menu
      title="General"
      showReloadAlert={showReloadAlert}
      setReloadAlert={setReloadAlert}
    >
      <SettingItem
        title={'Notifications'}
        subHeading={'Show connect/disconnect OS notifications.'}
        Icon={NotificationsIcon}
      >
        <ToggleSwitch
          toggleValue={allowSystemNotifications}
          onToggle={() => {
            dispatch(
              actions.allowSystemNotifications.setandlog({
                value: !allowSystemNotifications,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Show Location Load'}
        subHeading={'Show Location Load of each data center.'}
        Icon={ShowLocationLoadIcon}
      >
        <ToggleSwitch
          type={'Show Location Load'}
          toggleValue={locationLoadEnabled}
          onToggle={() => {
            dispatch(
              actions.locationLoadEnabled.setandlog({
                value: !locationLoadEnabled,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Debug Context Menu'}
        subHeading={'Show the debug log in the context menu.'}
        Icon={DebugMenuIcon}
      >
        <ToggleSwitch
          toggleValue={showDebugContextMenu}
          onToggle={() => {
            dispatch(actions.debugLog.togglecontextmenu())
          }}
        />
      </SettingItem>

      <SettingItem title={'Debug Log'} Icon={DebugLogIcon}>
        {debugLogSent ? (
          <Text aria-live="polite" fontSize={1} color={colors.fgLight}>
            {t('Sent!')}
          </Text>
        ) : (
          <Flex css={{ color: colors.fgLight, fontSize: '14px', gap: '16px' }}>
            <Text
              aria-label={t('View Debug Log')}
              onClick={openDebugLogView}
              css={{
                cursor: 'pointer',
                transition: '0.3s',
                ':hover': {
                  color: colors.fg,
                },
              }}
            >
              {t('View')}
            </Text>
            <Text
              aria-label={t('Send Debug Log')}
              onClick={() => {
                sendDebugLog()
                setDebugLogSent(true)
              }}
              css={{
                cursor: 'pointer',
                transition: '0.3s',
                ':hover': {
                  color: colors.fg,
                },
              }}
            >
              {t('Send')}
            </Text>
          </Flex>
        )}
      </SettingItem>
      <Flex css={{ marginBottom: '16px', justifyContent: 'center' }}>
        <KebabMenuIcon fill={colors.fgLight} />
      </Flex>
      <SettingLink
        title="View Licenses"
        openLink={() => websiteLink({ path: 'terms/oss' })}
      />
    </Menu>
  )
}
