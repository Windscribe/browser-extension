import React, { useState, useRef } from 'react'
import { css } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import { useDispatch, useConnect } from 'ui/hooks'
import { actions } from 'state/dux'
import { SettingGroup } from 'components/Settings'
import { Box, Flex, Text } from '@rebass/emotion'
import Branch from 'ui/Branch'
import SettingAlert from 'ui/Alert'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import AdvancedModeSettings from './AdvancedModeSettings'
import NormalModeSettings from './NormalModeSettings'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.activeTabId,
  s => s.advancedModeEnabled,
  (...args) => args,
)

const ACTIVITY = 'preferences_privacy'

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [activeTabId, advancedModeEnabled] = useConnect(selector)

  const toggleCookieMonster = v => () =>
    dispatch(
      actions.cookieMonsterEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )

  const toggleNotificationBlocker = v => () =>
    dispatch(
      actions.notificationBlockerEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )
  const toggleCookieMonsterMode = v =>
    dispatch(
      actions.cookieMonsterOnlyThirdParty.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )

  const [showReloadAlert, setReloadAlert] = useState(false)
  const viewContainerRef = useRef()
  const setReloadTrue = () => setTimeout(() => setReloadAlert(true), 500)

  const childProps = {
    setReloadTrue,
    toggleCookieMonster,
    toggleCookieMonsterMode,
    toggleNotificationBlocker,
    ACTIVITY,
  }

  return (
    <Flex flexDirection="column" innerRef={viewContainerRef}>
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

      <Box>
        <SettingGroup
          css={css`
            position: relative;
          `}
        >
          <Branch
            if={advancedModeEnabled}
            Then={() => <AdvancedModeSettings {...childProps} />}
            Else={() => <NormalModeSettings {...childProps} />}
          />
        </SettingGroup>
      </Box>
    </Flex>
  )
}
