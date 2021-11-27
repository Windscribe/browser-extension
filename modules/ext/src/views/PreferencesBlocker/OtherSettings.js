import React, { useState, useRef, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from 'ui/hooks'
import { actions } from 'state/dux'
import { SettingGroup } from 'components/Settings'
import ToggleSettingItem from './ToggleSettingItem'
import Tooltip from 'ui/Tooltip'
import { RotateContainer, SplitIconStyled, playSplit } from './styles'
import { ThemeContext, css } from '@emotion/core'
import { Box, Flex, Text } from '@rebass/emotion'
import { InlineButton } from 'ui/Button'
import Toggle from 'ui/Toggle'
import SettingAlert from 'ui/Alert'
import proxyTimeTooltipText from 'utils/proxyTimeTooltipText'
import { WithToolTip } from 'components/Utils'
import { createSelector } from 'reselect'
import ProxyTimeIcon from 'assets/time-icon.svg'

const timeWarpselector = createSelector(
  s => s.currentLocation,
  s => s.proxyTimeEnabled,
  s => s.proxy,
  (...args) => args,
)

const workBlockSelector = createSelector(
  s => s.workerBlockEnabled,
  (...args) => args,
)

const ACTIVITY = 'preferences_privacy'

const ProxyTimeToggle = ({ setReloadTrue, disabled }) => {
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [currentLocation, proxyTimeEnabled, proxy] = useConnect(
    timeWarpselector,
  )
  const toggleProxyTime = v => () => {
    dispatch(
      actions.proxyTimeEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )
  }
  return (
    <ToggleSettingItem
      title={t('Time Warp')}
      subHeading={t('Sets your browser time to match the connected proxy')}
      linkPath="features/timezone-spoofing"
      toggleState={proxyTimeEnabled}
      toggleEvent={toggleProxyTime(proxyTimeEnabled)}
      postToggleEvent={setReloadTrue}
      disabled={disabled}
      ControlComponent={props => (
        <Flex alignItems="center">
          {proxyTimeEnabled && (
            <RotateContainer>
              <Tooltip
                message={proxyTimeTooltipText({
                  timezone: currentLocation.timezone,
                  status: proxy.status,
                  proxyTimeEnabled,
                })}
              >
                <div>
                  <ProxyTimeIcon fill={colors.iconFg} />
                </div>
              </Tooltip>
            </RotateContainer>
          )}
          <WithToolTip tip={disabled && t('Not available in Autopilot')}>
            <span>
              <Toggle {...props} />
            </span>
          </WithToolTip>
        </Flex>
      )}
      aria-label={t(
        `Time Warp. Sets your browser time to match the connected proxy. ${
          disabled ? 'Not available in Autopilot' : ' '
        }`,
      )}
    />
  )
}

const SplitPersonalityToggle = React.forwardRef(
  ({ setReloadTrue, setReloadAlert, splitPersonalityEnabled }, ref) => {
    const theme = useConnect(s => s.theme)
    const dispatch = useDispatch()
    const toggleSplitPersonality = v => () => {
      const toggleVal = !v
      dispatch(
        actions.splitPersonalityEnabled.setandlog({
          value: toggleVal,
          logActivity: ACTIVITY,
        }),
      )
      dispatch(actions.userAgent[toggleVal ? 'activate' : 'deactivate']())
      randomizeUserAgent({ logActivity: ACTIVITY })
    }
    const randomizeUserAgent = () =>
      dispatch(actions.userAgent.randomize({ logActivity: ACTIVITY }))
    const [isSplitIconAnimating, setSplitAnimating] = useState(false)
    const { t } = useTranslation()

    return (
      <ToggleSettingItem
        title={t('Split Personality')}
        subHeading={t('Randomly rotates your user agent')}
        linkPath="features/split-personality"
        toggleState={splitPersonalityEnabled}
        toggleEvent={toggleSplitPersonality(splitPersonalityEnabled)}
        postToggleEvent={setReloadTrue}
        ControlComponent={props => (
          <Flex alignItems="center">
            {splitPersonalityEnabled && (
              <RotateContainer>
                <Tooltip message={t('Rotate user agent')}>
                  <InlineButton
                    ref={ref}
                    aria-live="polite"
                    tabIndex={0}
                    aria-label={t('Click to rotate your user agent')}
                    onClick={() => {
                      randomizeUserAgent()
                      setSplitAnimating(true)
                    }}
                    active
                    disabled={isSplitIconAnimating}
                  >
                    <SplitIconStyled
                      isDark={theme === 'dark'}
                      css={css`
                        animation-name: ${isSplitIconAnimating
                          ? playSplit
                          : 'none'};
                      `}
                      durationMs={2000}
                      onAnimationEnd={() => {
                        setSplitAnimating(false)
                        setReloadAlert(true)
                      }}
                    />
                  </InlineButton>
                </Tooltip>
              </RotateContainer>
            )}
            <Toggle
              {...props}
              aria-label={t(
                'Split Personality. Randomly rotates your user agent',
              )}
            />
          </Flex>
        )}
      />
    )
  },
)

const WorkerBlockToggle = ({ setReloadTrue }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [workerBlockEnabled] = useConnect(workBlockSelector)
  const toggle = v => () => {
    dispatch(
      actions.workerBlockEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )
  }
  return (
    <ToggleSettingItem
      title={t('Worker Block')}
      subHeading={t('Blocks web workers from running in the background')}
      linkPath="features/workerblock"
      toggleState={workerBlockEnabled}
      toggleEvent={toggle(workerBlockEnabled)}
      postToggleEvent={setReloadTrue}
      ControlComponent={props => (
        <Flex alignItems="center">
          <span>
            <Toggle {...props} />
          </span>
        </Flex>
      )}
      aria-label={t(
        'Worker Block. Blocks web workers from running in the background.',
      )}
    />
  )
}

const otherSettingsSelector = createSelector(
  s => s.activeTabId,
  s => s.webRTCEnabled,
  s => s.locationSpooferEnabled,
  s => s.currentLocation,
  s => s.splitPersonalityEnabled,
  s => s.proxyPort,
  (...xs) => xs,
)

export default () => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const [
    activeTabId,
    webRTCEnabled,
    locationSpooferEnabled,
    currentLocation,
    splitPersonalityEnabled,
  ] = useSelector(otherSettingsSelector)

  // for accessibility
  const isInitialMount = useRef(true)
  const splitPersonalityButtonRef = useRef(null)

  const isAutopilot = currentLocation.name === 'cruise_control'

  const toggleWebRTC = v => () => {
    dispatch(actions.webRTC[!v ? 'activate' : 'deactivate']())
    dispatch(
      actions.webRTCEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )
  }
  const toggleLocationSpoofer = v => () =>
    dispatch(
      actions.locationSpooferEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )

  const [showReloadAlert, setReloadAlert] = useState(false)
  const viewContainerRef = useRef()
  const setReloadTrue = () =>
    !showReloadAlert && setTimeout(() => setReloadAlert(true), 500)

  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      if (splitPersonalityButtonRef?.current) {
        setTimeout(() => {
          splitPersonalityButtonRef.current.focus()
        }, 100)
      }
    }
  }, [splitPersonalityEnabled])

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
        <SettingGroup>
          <ToggleSettingItem
            title={t('WebRTC Slayer')}
            subHeading={t(
              'Limits WebRTC requests to prevent leaks. This may break some applications',
            )}
            linkPath="features/webrtc-slayer"
            toggleState={webRTCEnabled}
            toggleEvent={toggleWebRTC(webRTCEnabled)}
            postToggleEvent={setReloadTrue}
            aria-label={t(
              'WebRTC Slayer. Limits WebRTC requests to prevent leaks. This may break some applications',
            )}
          />
          <ToggleSettingItem
            title={t('Location Warp')}
            subHeading={t(
              'Fakes your GPS location to match the connected proxy',
            )}
            linkPath="features/location-warp"
            toggleState={locationSpooferEnabled}
            toggleEvent={toggleLocationSpoofer(locationSpooferEnabled)}
            postToggleEvent={setReloadTrue}
            disabled={isAutopilot}
            ControlComponent={props => (
              <Flex alignItems="center">
                <WithToolTip
                  tip={isAutopilot && t('Not available in Autopilot')}
                >
                  <span>
                    <Toggle {...props} />
                  </span>
                </WithToolTip>
              </Flex>
            )}
            aria-label={t(
              `Location Warp. Fakes your GPS location to match the connected proxy. ${
                isAutopilot ? 'Not available in Autopilot' : ' '
              }`,
            )}
          />
          <ProxyTimeToggle
            disabled={isAutopilot}
            setReloadAlert={setReloadAlert}
            setReloadTrue={setReloadTrue}
          />
          <SplitPersonalityToggle
            setReloadAlert={setReloadAlert}
            setReloadTrue={setReloadTrue}
            splitPersonalityEnabled={splitPersonalityEnabled}
            ref={splitPersonalityButtonRef}
          />
          <WorkerBlockToggle
            setReloadAlert={setReloadAlert}
            setReloadTrue={setReloadTrue}
          />
        </SettingGroup>
      </Box>
    </Flex>
  )
}
