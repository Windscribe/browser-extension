import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Flex } from '@rebass/emotion'
import WhitelistIcon from 'assets/whitelist.svg'
import formatActiveTabInfo from 'plugins/tabs/format'
import { WithToolTip } from 'components/Utils'
import { DomainBarContext } from './'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  s => s.whitelist,
  (...args) => args,
)

export default () => {
  const { t } = useTranslation()
  const [tabs, activeTabId, whitelist] = useConnect(selector)
  const currentDomainInfo = formatActiveTabInfo(tabs[activeTabId])
  const { showingWhitelist, setShowingWhitelist } = useContext(DomainBarContext)
  const disabled = !!currentDomainInfo?.hostnameInvalid
  const { colors } = useTheme(ThemeContext)

  const existingWhitelistInfo = whitelist.find(
    x => x.domain === currentDomainInfo.hostname,
  )

  const iconFill = disabled
    ? colors.quarterwhite
    : existingWhitelistInfo
    ? colors.white
    : colors.halfwhite

  return (
    <WithToolTip tip={disabled ? '' : t('Whitelist Settings')}>
      <Flex
        px={'16px'}
        py={'8px'}
        ml="auto"
        aria-label={t('Whitelist Settings open')}
        onClick={() => {
          if (!disabled) setShowingWhitelist(!showingWhitelist)
        }}
        css={{
          position: 'relative',
          cursor: disabled ? 'default !important' : 'pointer',
          transition: '0.3s',
          fill: iconFill,
          ':hover': {
            fill: disabled ? colors.quarterwhite : colors.white,
          },
        }}
      >
        <WhitelistIcon />
      </Flex>
    </WithToolTip>
  )
}
