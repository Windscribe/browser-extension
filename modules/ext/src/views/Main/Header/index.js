import React, { useState } from 'react'
import { Flex, Text } from '@rebass/emotion'
import { css } from '@emotion/core'
import { IconButton } from 'ui/Button'
import { actions } from 'state'
import { useDispatch, useConnect, useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import Menu from 'assets/menu.svg'
import WsLogo from 'assets/ext-logo.svg'
import TopNavSlant from 'assets/top-nav-bg-right.svg'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { createSelector } from 'reselect'

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

const NotificationBadge = styled(Flex)`
  background: ${({ theme, hasUnreadNotifications }) =>
    hasUnreadNotifications ? theme.colors.green : 'none'};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.3s ease-out;
  cursor: pointer;
  z-index: 1;
  position: relative;
  bottom: 12px;
  left: 6px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.colors.quarterwhite};
  height: 14px;
`

const checkConnectedInterface = ({ currentInterface, proxy, session }) => {
  if (currentInterface === 'browser') {
    return (
      proxy.status === 'connected' ||
      proxy.status === 'connecting' ||
      proxy.status === 'error'
    )
  } else if (currentInterface === 'os') {
    const isVPNon = !!session?.our_ip
    return isVPNon
  }
}

const selector = createSelector(
  s => s.newsfeedIdsAlreadyViewed,
  s => s.newsfeedItems,
  s => s.proxy,
  s => s.session,
  (...args) => args,
)
export default ({ currentInterface }) => {
  const { t } = useTranslation()
  const [notificationRead, setNotificationRead] = useState(false)
  const [showNewsfeedBadge, setShowNewsfeedBadge] = useState(true)
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const setView = v => dispatch(actions.view.set(v))

  const [newsfeedIdsAlreadyViewed, newsfeedItems, proxy, session] = useConnect(
    selector,
  )
  const isConnected = checkConnectedInterface({
    currentInterface,
    proxy,
    session,
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
    <Header alignItems="center" bgColor={primaryBgColor}>
      <IconButton
        css={css`
          background: none !important;
          margin: 0 16px;
          path {
            fill: ${colors.white};
          }
          &:hover {
            background: ${isConnected
              ? colors.microwhite
              : colors.microblack} !important;
          }
        `}
        onClick={() => setView('Preferences')}
        aria-label={t('Preferences')}
      >
        <Menu className="joyride-element-opt-out" />
      </IconButton>
      <WsLogo
        css={css`
          overflow: visible;
          cursor: pointer;
          path {
            fill: ${colors.white};
          }
        `}
        onClick={() => dispatch(actions.view.set('Newsfeed'))}
        onMouseEnter={() => {
          !hasUnreadNotifications && setShowNewsfeedBadge(true)
        }}
        onMouseLeave={() => {
          !hasUnreadNotifications && setShowNewsfeedBadge(false)
        }}
      />
      <NotificationBadge
        show={showNewsfeedBadge}
        hasUnreadNotifications={hasUnreadNotifications}
        px={'3px'}
        onClick={() => dispatch(actions.view.set('Newsfeed'))}
      >
        <Text
          color={hasUnreadNotifications ? colors.black : colors.white}
          textAlign="center"
          fontWeight="700"
          fontSize="10px"
          css={css`
            padding-top: 3px;
            align-self: flex-end;
            margin: 0 auto;
          `}
        >
          {notificationRead
            ? newsfeedItems?.notifications?.length
            : numberOfUnreadNotifications}
        </Text>
      </NotificationBadge>
      <TopNavSlant
        css={css`
          fill: ${primaryBgColor};
          position: absolute;
          right: -46px;
          transition: 1s all ease;
        `}
      />
    </Header>
  )
}
