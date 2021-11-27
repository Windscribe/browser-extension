import React from 'react'
import { useConnect, useDispatch } from 'ui/hooks'
import { useTranslation } from 'react-i18next'
import { actions } from 'state'
import bytes from 'bytes'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Flex, Box, Text } from '@rebass/emotion'
import { css } from '@emotion/core'
import { WithToolTip } from 'components/Utils'
import addOneMonthToDate from 'utils/addOneMonthToDate'
import Branch from 'ui/Branch'
import websiteLink from 'utils/websiteLink'
import { SimpleButton } from 'ui/Button'
import LowerBumper from 'assets/lower-bumper.svg'
import { ACCOUNT_PLAN } from 'utils/constants'

const getUsageColor = (percentage, colors) => {
  if (percentage < 50) {
    return colors.green
  } else if (percentage < 75) {
    return colors.yellow
  } else {
    return colors.red
  }
}

const UsageText = props => (
  <Text color={props.color} fontSize={0} fontWeight="bold">
    {props.children}
  </Text>
)

export default ({ ...props }) => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()

  const { traffic_max, traffic_used, last_reset, username } = useConnect(
    s => s.session,
  )

  const percentageUsed = (traffic_used / traffic_max) * 100
  const remainingDataBytes = bytes(traffic_max - traffic_used)

  return (
    <Box
      aria-label={t('Usage Bar')}
      tabIndex={0}
      onClick={() => {
        if (username) {
          websiteLink({
            path: 'upgrade',
            params: { pcpid: 'upgrade_ext1' },
          })
        } else {
          //ghost-mode
          dispatch(actions.view.set('Signup'))
        }
      }}
      bg={colors.bg}
      css={css`
        z-index: 100;
        cursor: pointer;
        .upgrade {
          transition: color 0.3s ease;
        }
        &:hover {
          .upgrade {
            color: ${colors.white};
          }
        }
      `}
      {...props}
    >
      <LowerBumper
        fill={colors.bg}
        css={css`
          z-index: 100;
          position: absolute;
        `}
      />
      <LowerBumper
        fill={colors.bg}
        css={css`
          z-index: 100;
          position: absolute;
          left: calc(100% - 24px);
          transform: scaleX(-1);
        `}
      />
      <Flex py={'6px'} px={3} justifyContent="space-between" bg={colors.black}>
        <WithToolTip
          tip={`${t('Reset Date')}: ${addOneMonthToDate(last_reset)}`}
        >
          <Flex>
            <Branch
              if={traffic_max === ACCOUNT_PLAN.UNLIMITED}
              Then={() => (
                <UsageText color={colors.green}>{t('Unlimited')}</UsageText>
              )}
              Else={() => (
                <UsageText color={getUsageColor(percentageUsed, colors)}>
                  {parseFloat(remainingDataBytes) <= 0
                    ? t('Out of data')
                    : `${remainingDataBytes} ${t('Left')}`}
                </UsageText>
              )}
            />
          </Flex>
        </WithToolTip>

        <SimpleButton
          tabIndex={0}
          css={css`
            padding: 0;
          `}
        >
          <Text
            className="upgrade"
            fontSize={0}
            css={css`
              text-transform: uppercase;
            `}
            color={colors.halfwhite}
            fontWeight="bold"
          >
            {username ? t('upgrade') : t('get more data')}
          </Text>
        </SimpleButton>
      </Flex>
    </Box>
  )
}
