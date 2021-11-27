import React, { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import { css } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import styled from '@emotion/styled'
import { Flex } from '@rebass/emotion'
import WhitelistIcon from 'assets/whitelist_icon.svg'
import formatActiveTabInfo from 'plugins/tabs/format'
import CheckmarkIcon from 'assets/whitelist_checkmark_icon.svg'
import { WithToolTip } from 'components/Utils'
import { IconButton } from 'ui/Button'
import { DomainBarContext } from './'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  s => s.whitelist,
  (...args) => args,
)

const WhitelistButton = styled(IconButton)`
  background: transparent !important;
  * > svg > path {
    fill: ${({ disabled, theme }) =>
      disabled ? theme.colors.inactive : theme.colors.fg};
  }
`

export default () => {
  const { t } = useTranslation()
  const [tabs, activeTabId, whitelist] = useConnect(selector)
  const currentDomainInfo = formatActiveTabInfo(tabs[activeTabId])
  const { showingWhitelist, setShowingWhitelist } = useContext(DomainBarContext)
  const disabled = !!currentDomainInfo?.hostnameInvalid
  const disabledOpacity = 0.8
  const { colors } = useTheme(ThemeContext)

  const [shouldShowTip, setShouldShowTip] = useState(true)

  useEffect(() => {
    if (showingWhitelist) {
      setShouldShowTip(false)
    } else {
      setShouldShowTip(true)
    }
  }, [showingWhitelist])

  const existingWhitelistInfo = whitelist.find(
    x => x.domain === currentDomainInfo.hostname,
  )

  const checkmarkColor = existingWhitelistInfo ? colors.fg : colors.fgLight

  return (
    <WithToolTip tip={shouldShowTip ? t('Whitelist Settings') : ''}>
      <WhitelistButton
        px={3}
        py={2}
        color={colors.fg}
        ml="auto"
        disabled={disabled || showingWhitelist}
        aria-label={t('Whitelist Settings open')}
        onClick={() => {
          setShowingWhitelist(!showingWhitelist)
        }}
        css={css`
          position: relative;
          cursor: ${disabled ? 'default !important' : 'pointer'};
          opacity: ${disabledOpacity};
          transition: opacity 0.2s ease;
          &:hover {
            opacity: ${disabled ? disabledOpacity : 1};
          }
        `}
      >
        <Flex
          css={css`
            position: absolute;
          `}
        >
          <WhitelistIcon />
        </Flex>
        <Flex
          css={css`
            position: absolute;
            & svg path {
              fill: ${checkmarkColor};
            }
          `}
        >
          <CheckmarkIcon />
        </Flex>
      </WhitelistButton>
    </WithToolTip>
  )
}
