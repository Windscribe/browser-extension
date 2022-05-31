import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { useConnect, useDispatch } from 'ui/hooks'
import { createSelector } from 'reselect'
import { actions } from 'state/dux'
import { Flex } from '@rebass/emotion'
import Menu from '../Preferences/Menu'
import SettingItem from '../Preferences/SettingItem'
import SettingLink from '../Preferences/SettingLink'
import ToggleSwitch from '../Preferences/ToggleSwitch'
import { delay } from 'utils/delay'
import AdblockIcon from 'assets/settingIcons/adblock.svg'
import TrackersIcon from 'assets/settingIcons/trackers.svg'
import MalwareIcon from 'assets/settingIcons/malware.svg'
import SocialDistancingIcon from 'assets/settingIcons/socialDistancing.svg'
import CookieGoAwayIcon from 'assets/settingIcons/cookieGoAway.svg'
import AdvancedIcon from 'assets/settingIcons/advanced.svg'
import KebabMenuIcon from 'assets/kebabMenu.svg'

const ACTIVITY = 'preferences_blocker'

const selector = createSelector(
  s => s.blockLists,
  s => s.blockListsEnabled,
  s => s.ublockEnabled,
  s => s.advancedModeEnabled,
  (...args) => args,
)

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const [showReloadAlert, setReloadAlert] = useState(false)

  const [
    blockLists,
    blockListsEnabled,
    ublockEnabled,
    advancedModeEnabled,
  ] = useConnect(selector)

  const dispatch = useDispatch()

  const toggleAdvancedMode = () => {
    if (advancedModeEnabled) {
      dispatch(
        actions.advancedModeEnabled.setandlog({
          value: false,
          logActivity: ACTIVITY,
        }),
      )
      dispatch(actions.ublock.disableadvancedmode())
    } else {
      dispatch(
        actions.advancedModeEnabled.setandlog({
          value: true,
          logActivity: ACTIVITY,
        }),
      )
    }
  }

  const blockListLoaded = list => blockListsEnabled.includes(list)

  const blockListContentCache = {
    adblock: {
      title: t('Ad Crusher'),
      subHeading: t(
        'Indiscriminately annihilate all annoying ads with extreme prejudice.',
      ),
      linkPath: 'features/ad-blocking',
      icon: AdblockIcon,
    },
    trackers: {
      title: t('Tracker Eradicator'),
      subHeading: t('Stop trackers in their filthy tracks.'),
      linkPath: 'features/ad-blocking',
      icon: TrackersIcon,
    },
    malware: {
      title: t('Malware Evader'),
      subHeading: t(
        'Block access to known malware, phishing and other malicious domains.',
      ),
      linkPath: 'features/ad-blocking',
      icon: MalwareIcon,
    },
    social: {
      title: t('Social Distancing'),
      subHeading: t('Block tracking social network widgets and buttons.'),
      linkPath: 'features/ad-blocking',
      icon: SocialDistancingIcon,
    },
    cookieaway: {
      title: t('Cookie Go Away'),
      subHeading: t(
        'Blocks annoying "We use cookies" banners on all websites.',
      ),
      linkPath: 'features/ad-blocking',
      icon: CookieGoAwayIcon,
    },
  }

  const blockListContent = {}

  blockLists.list.forEach(l => {
    if (l?.description) {
      blockListContent[l.option] = {
        title: t(l.label),
        subHeading: t(l.description),
        linkPath: l.link,
        icon: l.icon,
      }
    } else {
      // use the cached data, since this users indexdb data is using old format still
      blockListContent[l.option] = blockListContentCache[l.option]
    }
  })

  return (
    <Menu
      title="Blocker"
      showReloadAlert={showReloadAlert}
      setReloadAlert={setReloadAlert}
    >
      {!advancedModeEnabled && (
        <>
          {blockLists.list.map(x => (
            <SettingItem
              key={x.option}
              title={blockListContent[x.option].title}
              subHeading={blockListContent[x.option].subHeading}
              path={blockListContent[x.option].linkPath}
              Icon={blockListContentCache[x.option].icon}
            >
              <ToggleSwitch
                toggleValue={blockListLoaded(x.option)}
                onToggle={async () => {
                  setReloadAlert(true)
                  if (ublockEnabled) {
                    dispatch(actions.view.set('UblockDetected'))
                  } else {
                    dispatch(
                      actions.blockListsEnabled.toggle({
                        listItem: x.option,
                        logActivity: ACTIVITY,
                      }),
                    )
                  }
                  await delay(250)
                }}
              />
            </SettingItem>
          ))}
          <Flex css={{ marginBottom: '16px', justifyContent: 'center' }}>
            <KebabMenuIcon fill={colors.fgLight} />
          </Flex>
        </>
      )}
      <SettingItem
        title={'Advanced Mode'}
        subHeading={
          'Manage all blocklists through the native uBlock interface.'
        }
        Icon={AdvancedIcon}
      >
        <ToggleSwitch
          toggleValue={advancedModeEnabled}
          onToggle={() => toggleAdvancedMode()}
        />
      </SettingItem>

      {advancedModeEnabled && (
        <SettingLink
          title="uBlock Settings"
          openLink={() => browser.tabs.create({ url: 'options-ui/index.html' })}
        />
      )}
    </Menu>
  )
}
