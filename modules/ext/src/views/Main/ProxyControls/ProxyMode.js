import React from 'react'
import { css } from '@emotion/core'
import { Flex, Text } from '@rebass/emotion'
import { cond } from 'lodash'
import Tooltip from 'ui/Tooltip'
import Info from 'assets/info-icon.svg'
import { colors } from 'styles/theme'

export default ({ currentLocation, proxy, session, t }) => {
  const isCruiseControl = currentLocation.name === 'cruise_control'

  const mode = cond([
    [() => !session.our_ip && isCruiseControl, () => 'automatic'],
    [() => !session.our_ip && !isCruiseControl, () => 'manual'],
    [() => !!session.our_ip && proxy.status === 'connected', () => 'doubleHop'],
    [() => !!session.our_ip && proxy.status !== 'connected', () => 'external'],
  ])()

  const writeContentBasedOnMode = content => content[mode] || content?.automatic

  return (
    <Flex alignItems="center">
      <Text fontWeight="bold" fontSize={1} color={colors.white}>
        {writeContentBasedOnMode({
          doubleHop: t('Double Hop Mode'),
          external: t('External Mode'),
          manual: t('Manual Mode'),
          automatic: t('Automatic Mode'),
        })}
      </Text>
      <Flex alignItems="center" pl={2}>
        <Tooltip
          message={writeContentBasedOnMode({
            doubleHop: t(
              'Location is handled by both you and your Windscribe desktop app',
            ),
            external: t('Location is handled by your Windscribe desktop app'),
            manual: t('Location is handled manually by you'),
            automatic: t('Location is handled automatically to unblock sites'),
          })}
          maxWidth="8rem"
        >
          <span>
            <Info
              css={css`
                margin-bottom: -3px;
              `}
            />
          </span>
        </Tooltip>
      </Flex>
    </Flex>
  )
}
