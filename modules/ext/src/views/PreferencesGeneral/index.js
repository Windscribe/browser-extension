import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from '@emotion/core'
import { useDispatch, useConnect } from 'ui/hooks'
import { Flex, Text, Box } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { InlineButton } from 'ui/Button'
import { SettingHeader, SettingItem } from 'components/Settings'
import { openDebugLogView } from 'utils/debugLogger'
import { createSelector } from 'reselect'
import { actions } from 'state'
import ToggleSettingItem from '../Preferences/ToggleSettingItem'
import SettingAlert from 'ui/Alert'
import { Scrollbars } from 'react-custom-scrollbars'
import websiteLink from 'utils/websiteLink'
import { WebLink } from 'components/Button'
import LinkOutIcon from 'assets/external-link-icon.svg'

const ACTIVITY = 'preferences_general'

const settingsSelector = createSelector(
  s => s.allowSystemNotifications,
  s => s.autoConnect,
  s => s.proxyPort,
  s => s.activeTabId,
  s => s.smokewall,
  s => s.showDebugContextMenu,
  (...settings) => settings,
)
export default () => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const [
    allowSystemNotifications,
    autoConnect,
    proxyPort,
    activeTabId,
    smokewall,
    showDebugContextMenu,
  ] = useConnect(settingsSelector)

  const setAutoConnect = v =>
    dispatch(actions.autoConnect.setandlog({ value: v, logActivity: ACTIVITY }))
  const setNotifications = v =>
    dispatch(
      actions.allowSystemNotifications.setandlog({
        value: v,
        logActivity: ACTIVITY,
      }),
    )
  const sendDebugLog = () =>
    dispatch(actions.debugLog.send({ logActivity: ACTIVITY }))

  const [debugLogSent, setDebugLogSent] = useState(false)
  const [showReloadAlert, setReloadAlert] = useState(false)
  const viewContainerRef = useRef()
  const timerRef = useRef(null)
  const setReloadTrue = () => {
    if (!showReloadAlert) {
      timerRef.current = setTimeout(() => setReloadAlert(true), 500)
    }
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [timerRef])

  return (
    <Flex
      flexDirection="column"
      bg={colors.bg}
      css={css`
        height: 100%;
      `}
      innerRef={viewContainerRef}
    >
      <SettingHeader prefName={t('General')} />
      {viewContainerRef.current && (
        <SettingAlert
          content={
            <Text color={colors.white}>{t('Refresh to see changes')}</Text>
          }
          showing={showReloadAlert}
          topOffset="21px"
          domNode={viewContainerRef.current}
          onClick={() => {
            browser.tabs.reload(activeTabId).then(() => setReloadAlert(false))
          }}
        />
      )}
      <Box ml={3} mt={1}>
        <Scrollbars
          style={{ height: 354 }}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{ ...style, backgroundColor: colors.scrollBar }}
            />
          )}
        >
          <SettingItem
            pt={3}
            title={t('Auto-Connect')}
            subHeading={t('Automatically connect on browser start')}
            checked={autoConnect}
            onChange={() => setAutoConnect(!autoConnect)}
            aria-label={t(
              'Auto-Connect. Automatically connect on browser start',
            )}
          />
          <SettingItem
            title={t('Notifications')}
            subHeading={t('Show connect/disconnect OS notifications')}
            checked={allowSystemNotifications}
            onChange={() => setNotifications(!allowSystemNotifications)}
            aria-label={t('Notifications')}
          />
          <ToggleSettingItem
            title={t('Smokewall')}
            subHeading="Do not disconnect even on proxy failure"
            checked={smokewall}
            onClick={() => {
              dispatch(actions.smokewall.set(!smokewall))
            }}
            aria-label={t(`Do not disconnect even on proxy failure`)}
          />
          <ToggleSettingItem
            title={t('Debug Context Menu')}
            subHeading="Show the debug log in the context menu"
            checked={showDebugContextMenu}
            onClick={() => {
              dispatch(actions.debugLog.togglecontextmenu())
            }}
            aria-label={t(`Show the debug log in the context menu`)}
          />
          {/** Moved here from Privacy tab */}
          <ToggleSettingItem
            title={t('Proxy Port')}
            subHeading="80 / 443"
            checked={proxyPort === 443}
            onClick={() => {
              dispatch(actions.proxyPort.set(proxyPort === 443 ? 80 : 443))
            }}
            postToggleEvent={setReloadTrue}
            aria-label={t(`Proxy Port. Unchecked is 80, checked is 443`)}
          />
          <SettingItem
            title={t('Debug Log')}
            ControlComponent={() =>
              debugLogSent ? (
                <Text aria-live="polite" fontSize={1} color={colors.fgLight}>
                  {t('Sent!')}
                </Text>
              ) : (
                <Flex>
                  <InlineButton
                    aria-label={t('View Debug Log')}
                    tabIndex={0}
                    solid
                    color={colors.primary}
                    css={css`
                      margin-right: 16px !important;
                    `}
                    onClick={openDebugLogView}
                  >
                    <Text fontSize={1}>{t('View')}</Text>
                  </InlineButton>
                  <InlineButton
                    aria-label={t('Send Debug Log')}
                    tabIndex={0}
                    solid
                    color={colors.primary}
                    onClick={() => {
                      sendDebugLog()
                      setDebugLogSent(true)
                    }}
                  >
                    <Text fontSize={1}>{t('Send')}</Text>
                  </InlineButton>
                </Flex>
              )
            }
          />
          <WebLink
            aria-label={t('Licenses')}
            onClick={() => websiteLink({ path: 'terms/oss' })}
            width={'100%'}
          >
            <SettingItem
              noBorder
              title={t('View Licenses')}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
              ControlComponent={() => (
                <LinkOutIcon
                  css={css`
                    path {
                      fill: ${colors.iconFg};
                    }
                  `}
                />
              )}
            />
          </WebLink>
        </Scrollbars>
      </Box>
    </Flex>
  )
}
