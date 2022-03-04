import React from 'react'
import formatActiveTabInfo from 'plugins/tabs/format'
import { DomainRow } from './style'
import WhitelistButton from './WhitelistButton'
import WhitelistButtonRow from './WhitelistButtonRow'
import DomainName from './DomainName'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { css } from '@emotion/core'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  (...xs) => xs,
)

export default () => {
  const { colors } = useTheme(ThemeContext)
  const [tabs, activeTabId] = useSelector(selector)
  const currentDomainInfo = formatActiveTabInfo(tabs[activeTabId])
  const { hostname, hostnameInvalid } = currentDomainInfo
  const domainColor = hostnameInvalid ? colors.quarterwhite : colors.halfwhite

  return (
    <>
      <DomainRow
        alignItems="center"
        className="joyride-element-whitelist"
        css={css`
          min-height: 50px;
        `}
      >
        <DomainName color={domainColor} hostname={hostname} />
        <WhitelistButton currentDomainInfo={currentDomainInfo} />
      </DomainRow>
      <WhitelistButtonRow />
    </>
  )
}
