import React from 'react'
import { useConnect, useDispatch } from 'ui/hooks'
import { actions } from 'state'
import { IS_CHROME } from 'utils/constants'
import { Flex } from '@rebass/emotion'
import styled from '@emotion/styled'
import { css, ThemeContext } from '@emotion/core'
import ChromeIcon from 'assets/interfaces/chrome-icon.svg'
import FirefoxIcon from 'assets/interfaces/firefox-icon.svg'
import WindowsIcon from 'assets/interfaces/windows-icon.svg'
import MacIcon from 'assets/interfaces/apple-icon.svg'
import LinuxIcon from 'assets/interfaces/linux-icon.svg'
import AndroidIcon from 'assets/interfaces/android-icon.svg'
import OpenBsdIcon from 'assets/interfaces/openbsd-icon.svg'
import ChromeOsIcon from 'assets/interfaces/chromeOS-icon.svg'
import UnknownIcon from 'assets/connection-selected.svg'
import { createSelector } from 'reselect'

import { useTheme } from 'ui/hooks'
import { SimpleButton } from 'ui/Button'
const INTERFACE_MAP = {
  browser: { chrome: ChromeIcon, firefox: FirefoxIcon },
  // desktop keys are mapped to runtime.PlatformOs
  os: {
    android: AndroidIcon,
    cros: ChromeOsIcon,
    linux: LinuxIcon,
    mac: MacIcon,
    openbsd: OpenBsdIcon,
    win: WindowsIcon,

    unknown: UnknownIcon,
  },
}
const InterfaceBar = styled(Flex)`
  z-index: 30;
  height: 40px;
  width: fit-content;
  position: absolute;
  top: 0px;
  right: 0px;
  background: transparent;
`

const Interface = ({
  setHoveringOnInterface,
  InterfaceIcon,
  isProxyOn = false,
  isInterfaceSelected = false,
  interfaceName,
  onClick = () => {},
  ...props
}) => {
  const { colors } = useTheme(ThemeContext)
  const interfaceFill = isProxyOn ? colors.green : colors.white
  const dispatch = useDispatch()
  return (
    <SimpleButton
      tabIndex={0}
      aria-label={interfaceName}
      role="tab"
      aria-selected={isInterfaceSelected}
      onMouseEnter={() => !isInterfaceSelected && setHoveringOnInterface(true)}
      onMouseLeave={() => setHoveringOnInterface(false)}
      onClick={e => {
        dispatch(actions.session.get())
        setHoveringOnInterface(false)
        onClick(e)
      }}
      css={css`
        cursor: pointer;
        height: 35px;
        padding: 0;
        margin: 0 0 12px 16px;
        transition: border-bottom 0.5s;
        svg {
          opacity: ${isProxyOn || isInterfaceSelected ? 1 : 0.5};
          transition: opacity ease 0.5s;
        }
        &:hover > svg {
          opacity: 1;
        }

        border-bottom: 2px solid
          ${isInterfaceSelected ? interfaceFill : 'transparent'} !important;
      `}
      {...props}
    >
      <InterfaceIcon fill={interfaceFill} />
    </SimpleButton>
  )
}

const selector = createSelector(
  s => s.proxy?.status,
  s => s.currentOS,
  s => s.session,
  (...args) => args,
)

export default ({
  hoveringOnInterface,
  setHoveringOnInterface,
  currentInterface,
  setInterface,
}) => {
  // TODO: need to heavily hybridize main screen as switching to desktop should show currently connect vpn location [otherwise everything remains the same]
  const [proxyStatus, currentOS, session] = useConnect(selector)

  return (
    <InterfaceBar p={3} pr={4}>
      <Interface
        hoveringOnInterface={hoveringOnInterface}
        setHoveringOnInterface={setHoveringOnInterface}
        onClick={() => setInterface('browser')}
        InterfaceIcon={INTERFACE_MAP.browser[IS_CHROME ? 'chrome' : 'firefox']}
        isProxyOn={proxyStatus === 'connected' || proxyStatus === 'error'}
        isInterfaceSelected={currentInterface === 'browser'}
        interfaceName="browser"
        className="joyride-element-browser"
      />
      <Interface
        hoveringOnInterface={hoveringOnInterface}
        setHoveringOnInterface={setHoveringOnInterface}
        onClick={() => setInterface('os')}
        InterfaceIcon={INTERFACE_MAP.os[currentOS]}
        isProxyOn={!!session?.our_ip}
        isInterfaceSelected={currentInterface === 'os'}
        interfaceName="os"
        className="joyride-element-desktop"
      />
    </InterfaceBar>
  )
}
