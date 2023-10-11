import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Flex } from '@rebass/emotion'
import AllowlistIcon from 'assets/allowlist.svg'
import formatActiveTabInfo from 'plugins/tabs/format'
import { WithToolTip } from 'components/Utils'
import { DomainBarContext } from '.'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  s => s.allowlist,
  (...args) => args,
)

export default () => {
  const { t } = useTranslation()
  const [tabs, activeTabId, allowlist] = useConnect(selector)
  const currentDomainInfo = formatActiveTabInfo(tabs[activeTabId])
  const { showingAllowlist, setShowingAllowlist } = useContext(DomainBarContext)
  const disabled = !!currentDomainInfo?.hostnameInvalid
  const { colors } = useTheme(ThemeContext)

  const existingAllowlistInfo = allowlist.find(
    x => x.domain === currentDomainInfo.hostname,
  )

  const iconFill = disabled
    ? colors.quarterwhite
    : existingAllowlistInfo
    ? colors.white
    : colors.halfwhite

  return (
    <WithToolTip tip={disabled ? '' : t('Allowlist Settings')}>
      <Flex
        px={'16px'}
        py={'8px'}
        ml="auto"
        aria-label={t('Allowlist Settings open')}
        onClick={() => {
          if (!disabled) setShowingAllowlist(!showingAllowlist)
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
        <AllowlistIcon />
      </Flex>
    </WithToolTip>
  )
}
