import React, { useState } from 'react'
import { Flex } from '@rebass/emotion'
import { css } from '@emotion/core'
import { actions } from 'state'
import { useDispatch, useConnect, useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import Menu from 'assets/menu.svg'
import WsLogo from 'assets/ext-logo.svg'
import TopNavSlant from 'assets/top-nav-bg-right.svg'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { createSelector } from 'reselect'
import BlockerIcon from 'assets/blocker-icon.svg'
import PrivacyIcon from 'assets/privacy-icon.svg'
import HeaderIcon from './HeaderIcon'

const Header = styled(Flex)`
  background-color: ${({ bgColor }) => bgColor};
  z-index: 99;
  height: 56px;
  width: 186px;
  position: absolute;
  top: 0px;
  left: 0px;
  transition: 1s all ease;
`

const checkConnectedInterface = ({ proxy }) => {
  return (
    proxy.status === 'connected' ||
    proxy.status === 'connecting' ||
    proxy.status === 'error'
  )
}

const selector = createSelector(
  s => s.newsfeedIdsAlreadyViewed,
  s => s.newsfeedItems,
  s => s.proxy,
  s => s.blockListsEnabled,
  s => s.privacyOptionsCount,
  (...args) => args,
)
export default () => {
  const { t } = useTranslation()
  const [notificationRead, setNotificationRead] = useState(false)
  const [showNewsfeedBadge, setShowNewsfeedBadge] = useState(true)
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const setView = v => dispatch(actions.view.set(v))

  const [
    newsfeedIdsAlreadyViewed,
    newsfeedItems,
    proxy,
    blockListsEnabled,
    privacyOptionsCount,
  ] = useConnect(selector)
  const isConnected = checkConnectedInterface({
    proxy,
  })
  const primaryBgColor = isConnected ? colors.halfblack : colors.darkgrey
  const unreadNewsfeedItems =
    newsfeedItems?.notifications?.filter(
      i => !newsfeedIdsAlreadyViewed?.includes(i.id),
    ) || []
  const numberOfUnreadNotifications = unreadNewsfeedItems.length
  const hasUnreadNotifications = numberOfUnreadNotifications > 0

  if (!hasUnreadNotifications && !notificationRead) {
    setShowNewsfeedBadge(false)
    setNotificationRead(true)
  } else if (notificationRead && hasUnreadNotifications) {
    setShowNewsfeedBadge(true)
    setNotificationRead(false)
  }

  return (
    <>
      <Header alignItems="center" bgColor={primaryBgColor}>
        <Menu
          className="joyride-element-opt-out"
          css={{
            cursor: 'pointer',
            background: 'none !important',
            margin: '0 24px',
            fill: colors.halfwhite,
            transition: 'fill 0.3s ease-out',
            ':hover': {
              fill: colors.white,
            },
          }}
          onClick={() => setView('Preferences')}
          aria-label={t('Preferences')}
        />
        <Flex
          css={{ cursor: 'pointer' }}
          onClick={() => dispatch(actions.view.set('Newsfeed'))}
          onMouseEnter={() => {
            !hasUnreadNotifications && setShowNewsfeedBadge(true)
          }}
          onMouseLeave={() => {
            !hasUnreadNotifications && setShowNewsfeedBadge(false)
          }}
        >
          <WsLogo
            css={css`
              overflow: visible;
              cursor: pointer;
              path {
                fill: ${colors.white};
              }
            `}
          />
          <Flex
            css={{
              borderRadius: '50%',
              position: 'absolute',
              height: '14px',
              width: '14px',
              backgroundColor: colors.lightGreen,
              alignItems: 'center',
              justifyContent: 'center',
              top: '12px',
              right: '-4px',
              boxSizing: 'content-box',
              background: hasUnreadNotifications ? colors.lightGreen : 'none',
              opacity: showNewsfeedBadge ? 1 : 0,
              border: hasUnreadNotifications
                ? 'none'
                : `1px solid ${colors.quarterwhite}`,
              zIndex: '1',
            }}
          >
            <Flex
              pt={'1px'}
              css={{
                fontSize: '9px',
                color: hasUnreadNotifications ? colors.green : colors.white,
                fontWeight: '700',
                lineHeight: '0',
              }}
            >
              {notificationRead
                ? newsfeedItems?.notifications?.length
                : numberOfUnreadNotifications}
            </Flex>
          </Flex>
        </Flex>
        <TopNavSlant
          css={css`
            fill: ${primaryBgColor};
            position: absolute;
            right: -46px;
            transition: 1s all ease;
          `}
        />
      </Header>
      <Flex
        css={{
          position: 'absolute',
          top: '0px',
          right: '0px',
          zIndex: '30',
          padding: '16px',
          gap: '8px',
        }}
      >
        <HeaderIcon
          Icon={PrivacyIcon}
          view={'PreferencesPrivacy'}
          count={privacyOptionsCount}
          className={'joyride-element-privacy'}
          primaryBgColor={primaryBgColor}
        />
        <HeaderIcon
          Icon={BlockerIcon}
          view={'PreferencesBlocker'}
          count={blockListsEnabled.length}
          className={'joyride-element-blocker'}
          primaryBgColor={primaryBgColor}
        />
      </Flex>
    </>
  )
}
