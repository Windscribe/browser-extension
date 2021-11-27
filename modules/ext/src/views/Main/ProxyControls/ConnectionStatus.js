import React from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import { Flex, Text } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import NoInternetSvg from 'assets/nointernet-icon.svg'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.proxy?.status,
  s => s.online,
  (...args) => args,
)

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const [status, online] = useConnect(selector)
  return (
    <Flex justifyContent="space-between">
      <Text
        tabIndex={0}
        aria-live="polite"
        fontSize={0}
        fontWeight="bold"
        color={
          !online || status === 'unknown'
            ? colors.yellow
            : status === 'disconnected'
            ? colors.white
            : colors.green
        }
        css={css`
          text-transform: uppercase;
          margin-right: 8px;
        `}
      >
        {!online ? (
          <NoInternetSvg /> //t('No Internet')
        ) : status === 'connected' ? (
          t('ON ')
        ) : status === 'connecting' ? (
          t('Connecting...')
        ) : status === 'unknown' ? (
          t('Not Detected!')
        ) : status === 'disconnecting' ? (
          t('Disconnecting...')
        ) : status === 'error' ? (
          t('ON')
        ) : (
          t('OFF ')
        )}
      </Text>
    </Flex>
  )
}
