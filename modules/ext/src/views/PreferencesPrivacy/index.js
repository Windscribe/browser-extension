import React, { useState, useRef, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from 'ui/hooks'
import { actions } from 'state/dux'
import Tooltip from 'ui/Tooltip'
import { Box } from '@rebass/emotion'
import { RotateContainer, SplitIconStyled, playSplit } from './styles'
import { ThemeContext, css } from '@emotion/core'
import { InlineButton } from 'ui/Button'
import proxyTimeTooltipText from 'utils/proxyTimeTooltipText'
import { createSelector } from 'reselect'
import ProxyTimeIcon from 'assets/time-icon.svg'
import CookieMonsterSelect from './CookieMonsterSelect'
import NotificationBlockSetting from './NotificationBlockSetting'
import SettingItem from '../Preferences/SettingItem'
import ToggleSwitch from '../Preferences/ToggleSwitch'
import SplitPersonalityIcon from 'assets/settingIcons/splitPersonality.svg'
import CookieMonsterIcon from 'assets/settingIcons/cookieMonster.svg'
import DoNotDisturbIcon from 'assets/settingIcons/doNotDisturb.svg'
import LanguageWarpIcon from 'assets/settingIcons/languageWarp.svg'
import TimeWarpIcon from 'assets/settingIcons/timeWarp.svg'
import LocationWarpIcon from 'assets/settingIcons/locationWarp.svg'
import WebRTCIcon from 'assets/settingIcons/webRTC.svg'
import WorkerBlockIcon from 'assets/settingIcons/workerBlock.svg'
import Menu from '../Preferences/Menu'

const ACTIVITY = 'preferences_privacy'

const selector = createSelector(
  s => s.webRTCEnabled,
  s => s.locationSpooferEnabled,
  s => s.currentLocation,
  s => s.splitPersonalityEnabled,
  s => s.privacyOptionsCount,
  s => s.proxyTimeEnabled,
  s => s.proxy,
  s => s.languageSwitchEnabled,
  s => s.notificationBlockerEnabled,
  s => s.workerBlockEnabled,
  s => s.cookieMonsterEnabled,
  s => s.cookieMonsterOnlyThirdParty,
  (...args) => args,
)

export default () => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const [
    webRTCEnabled,
    locationSpooferEnabled,
    currentLocation,
    splitPersonalityEnabled,
    privacyOptionsCount,
    proxyTimeEnabled,
    proxy,
    languageSwitchEnabled,
    notificationBlockerEnabled,
    workerBlockEnabled,
    cookieMonsterEnabled,
    cookieMonsterOnlyThirdParty,
  ] = useSelector(selector)

  const setPrivacyOptionsCount = v => {
    dispatch(
      actions.privacyOptionsCount.set(
        v ? privacyOptionsCount - 1 : privacyOptionsCount + 1,
      ),
    )
  }

  // for accessibility
  const isInitialMount = useRef(true)
  const splitPersonalityButtonRef = useRef(null)

  const isAutopilot = currentLocation.name === 'cruise_control'

  const [showReloadAlert, setReloadAlert] = useState(false)

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

  const randomizeUserAgent = () =>
    dispatch(actions.userAgent.randomize({ logActivity: ACTIVITY }))

  const [isSplitIconAnimating, setSplitAnimating] = useState(false)

  return (
    <Menu
      title="Privacy"
      showReloadAlert={showReloadAlert}
      setReloadAlert={setReloadAlert}
    >
      <SettingItem
        title={'Cookie Monster'}
        subHeading={'Delete Cookies when tab is closed.'}
        path={'features/cookie-monster'}
        Icon={CookieMonsterIcon}
        alignCenter={false}
      >
        <Box css={{ height: cookieMonsterEnabled ? '100px' : 'auto' }}>
          <ToggleSwitch
            toggleValue={cookieMonsterEnabled}
            onToggle={() => {
              setReloadAlert(true)
              setPrivacyOptionsCount(cookieMonsterEnabled)
              dispatch(
                actions.cookieMonsterEnabled.setandlog({
                  value: !cookieMonsterEnabled,
                  logActivity: ACTIVITY,
                }),
              )
            }}
          />
          <Box
            css={{
              position: 'absolute',
              left: '64px',
              width: '224px',
            }}
          >
            <CookieMonsterSelect
              checked={cookieMonsterEnabled}
              onlyThirdParty={cookieMonsterOnlyThirdParty}
              changeMode={() => {
                dispatch(
                  actions.cookieMonsterOnlyThirdParty.setandlog({
                    value: !cookieMonsterOnlyThirdParty,
                    logActivity: ACTIVITY,
                  }),
                )
                setReloadAlert(true)
              }}
            />
          </Box>
        </Box>
      </SettingItem>
      <SettingItem
        title={'Do Not Disturb'}
        subHeading={'Block all sites from spamming you with notifications.'}
        path={'features/dnd'}
        Icon={DoNotDisturbIcon}
      >
        <NotificationBlockSetting
          notificationBlockerEnabled={notificationBlockerEnabled}
          setReloadAlert={setReloadAlert}
          setPrivacyOptionsCount={setPrivacyOptionsCount}
        />
      </SettingItem>
      <SettingItem
        title={'WebRTC Slayer'}
        subHeading={
          'Limits WebRTC requests to prevent leaks. This may break some applications.'
        }
        path={'features/webrtc-slayer'}
        Icon={WebRTCIcon}
      >
        <ToggleSwitch
          toggleValue={webRTCEnabled}
          onToggle={() => {
            setReloadAlert(true)
            setPrivacyOptionsCount(webRTCEnabled)
            dispatch(
              actions.webRTC[!webRTCEnabled ? 'activate' : 'deactivate'](),
            )
            dispatch(
              actions.webRTCEnabled.setandlog({
                value: !webRTCEnabled,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Location Warp'}
        subHeading={'Fakes your GPS location to match the connected proxy.'}
        path={'features/location-warp'}
        Icon={LocationWarpIcon}
      >
        <ToggleSwitch
          toggleValue={locationSpooferEnabled}
          disabled={isAutopilot}
          onToggle={() => {
            setReloadAlert(true)
            setPrivacyOptionsCount(locationSpooferEnabled)
            dispatch(
              actions.locationSpooferEnabled.setandlog({
                value: !locationSpooferEnabled,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Time Warp'}
        subHeading={'Sets your browser time to match the connected proxy.'}
        path={'features/timezone-spoofing'}
        Icon={TimeWarpIcon}
      >
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
        <ToggleSwitch
          toggleValue={proxyTimeEnabled}
          disabled={isAutopilot}
          onToggle={() => {
            setReloadAlert(true)
            setPrivacyOptionsCount(proxyTimeEnabled)
            dispatch(
              actions.proxyTimeEnabled.setandlog({
                value: !proxyTimeEnabled,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Language Warp'}
        subHeading={
          'Sets your language and locale settings to match the connected proxy'
        }
        path={'features/languagewarp'}
        Icon={LanguageWarpIcon}
      >
        <ToggleSwitch
          toggleValue={languageSwitchEnabled}
          disabled={isAutopilot}
          onToggle={() => {
            setReloadAlert(true)
            setPrivacyOptionsCount(languageSwitchEnabled)
            dispatch(
              actions.languageSwitchEnabled.setandlog({
                value: !languageSwitchEnabled,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Split Personality'}
        subHeading={'Randomly rotates your user agent.'}
        path={'features/split-personality'}
        Icon={SplitPersonalityIcon}
      >
        {splitPersonalityEnabled && (
          <RotateContainer>
            <Tooltip message={t('Rotate user agent')}>
              <InlineButton
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
        <ToggleSwitch
          toggleValue={splitPersonalityEnabled}
          onToggle={() => {
            setReloadAlert(true)
            setPrivacyOptionsCount(splitPersonalityEnabled)
            dispatch(
              actions.userAgent[
                !splitPersonalityEnabled ? 'activate' : 'deactivate'
              ](),
            )
            dispatch(
              actions.splitPersonalityEnabled.setandlog({
                value: !splitPersonalityEnabled,
                logActivity: ACTIVITY,
              }),
            )
            randomizeUserAgent({ logActivity: ACTIVITY })
          }}
        />
      </SettingItem>
      <SettingItem
        title={'Worker Block'}
        subHeading={'Blocks web workers from running in the background.'}
        path={'features/worker-block'}
        Icon={WorkerBlockIcon}
      >
        <ToggleSwitch
          toggleValue={workerBlockEnabled}
          onToggle={() => {
            setReloadAlert(true)
            setPrivacyOptionsCount(workerBlockEnabled)
            dispatch(
              actions.workerBlockEnabled.setandlog({
                value: !workerBlockEnabled,
                logActivity: ACTIVITY,
              }),
            )
          }}
        />
      </SettingItem>
    </Menu>
  )
}
