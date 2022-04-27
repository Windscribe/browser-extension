import React, { useState, memo } from 'react'
import { WithToolTip } from 'components/Utils'
import { proxyTimeIconSmallBase64 } from './styles'
import proxyTimeTooltipText from 'utils/proxyTimeTooltipText'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Flex, Text } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import writeTextToClipboard from 'utils/writeTextToClipboard'
import ProxyFailure from './ProxyFailure'

const MAX_IP_WIDTH = 170 // ipv6 addrs are too long to display

const selector = createSelector(
  s => s.proxy.status,
  s => s.proxy.publicIp,
  s => s.currentLocation.name,
  s => s.currentLocation.timezone,
  s => s.session.our_ip,
  s => s.session.our_addr,
  s => s.proxyTimeEnabled,
  s => s.online,
  (...args) => args,
)

export default memo(({ showIpCopiedAlert, setIpCopiedAlert }) => {
  const [
    status,
    publicIp,
    currentLocationName,
    timezone,
    our_ip,
    our_addr,
    proxyTimeEnabled,
    online,
  ] = useSelector(selector)

  const { colors } = useTheme(ThemeContext)
  const [isIpBlurred, setIsIpBlurred] = useState(false)

  const isConnected = status === 'connected'
  let currentIp = !!our_ip && !isConnected ? our_addr : publicIp

  if (!currentIp || currentIp.length < 1) {
    currentIp = '---.---.---.---'
  }

  let ipClickTimeout = null

  const ipColor = () => {
    if (isIpBlurred) {
      return 'transparent'
    } else if (online) {
      return isConnected ? colors.green : colors.halfwhite
    } else {
      return colors.yellow
    }
  }

  const handleIpClicks = () => {
    if (status === 'error') return
    if (ipClickTimeout !== null) {
      // execute double click action
      setIsIpBlurred(!isIpBlurred)
      clearTimeout(ipClickTimeout)
      ipClickTimeout = null
    } else {
      // single click registered
      ipClickTimeout = setTimeout(() => {
        // execute single click action
        if (!showIpCopiedAlert) {
          setIpCopiedAlert(true)
          setTimeout(() => {
            setIpCopiedAlert(false)
          }, 2000)
        }
        clearTimeout(ipClickTimeout)
        ipClickTimeout = null
      }, 450)
    }
  }
  return (
    <WithToolTip
      tip={
        status !== 'error' && currentLocationName !== 'cruise_control'
          ? proxyTimeTooltipText({
              timezone,
              status,
              proxyTimeEnabled,
            })
          : ''
      }
    >
      <Flex
        css={css`
          max-width: ${MAX_IP_WIDTH}px;
          ${status !== 'error' &&
          proxyTimeEnabled &&
          currentLocationName !== 'cruise_control' &&
          `&::after {
            opacity: 0.6;
            position: relative;
            bottom: 0.5rem;
            content: url(${proxyTimeIconSmallBase64});
          }`}
        `}
      >
        <Text
          tabIndex={0}
          label="ip-address"
          aria-label={
            status === 'error' ? 'Proxy failure' : `Ip Address is ${currentIp}`
          }
          px={'4px'}
          ml={'-4px'}
          css={css`
            user-select: none;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: ${status === 'error' ? 'default' : 'pointer'};
            ${isIpBlurred && `text-shadow: 0px 0px 6px rgba(255,255,255,0.5);`}
          `}
          fontSize={0}
          notranslate="true"
          color={ipColor()}
          onClick={() => handleIpClicks()}
          onMouseUp={() => {
            writeTextToClipboard(currentIp)
          }}
        >
          {status === 'error' ? <ProxyFailure /> : currentIp}
        </Text>
      </Flex>
    </WithToolTip>
  )
})
