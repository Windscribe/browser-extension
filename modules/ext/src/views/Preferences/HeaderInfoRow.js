import React from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import bytes from 'bytes'
import { WebLink } from 'components/Button'
import Branch from 'ui/Branch'
import ConfirmEmail from './ConfirmEmail'
import { Flex, Text } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import styled from '@emotion/styled'
import { InlineButton } from 'ui/Button'
import websiteLink from 'utils/websiteLink'
import { EMAIL, ACCOUNT_PLAN, IS_CHROME } from 'utils/constants'
import { actions } from 'state'
import { useDispatch } from 'ui/hooks'

const ConfirmEmailContainer = styled(Flex)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.orange};
`

const ConfirmYourEmailHeader = ({ resendConfirmation, confirmationSent }) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  return (
    <ConfirmEmailContainer px={4} py={3}>
      {confirmationSent && (
        <Text aria-live="polite" fontSize={0} color={colors.white}>
          {t('Confirmation email sent!')}
        </Text>
      )}

      {!confirmationSent && (
        <Flex style={{ width: '100%' }} justifyContent="space-between">
          <Text fontSize={0} color={colors.white}>
            {t('Please confirm your email')}
          </Text>
          <InlineButton
            aria-label={t('resend confirmation email')}
            opacity="0.6"
            light
            onClick={resendConfirmation}
          >
            <Text color={colors.white} fontWeight="bold" fontSize={0}>
              {t('Resend').toLocaleUpperCase()}
            </Text>
          </InlineButton>
        </Flex>
      )}
    </ConfirmEmailContainer>
  )
}

export default () => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const {
    traffic_max,
    traffic_used = 0,
    is_premium,
    email,
    email_status,
    username,
    session_auth_hash,
  } = useConnect(s => s.session)
  const dispatch = useDispatch()

  const remainingDataBytes = bytes(traffic_max - traffic_used)
  const cpid = IS_CHROME ? 'ext_chrome' : 'ext_firefox'
  const platform = IS_CHROME ? 'chrome' : 'firefox'

  return (
    <Branch
      if={email && email_status === EMAIL.UNCONFIRMED}
      Then={() => (
        <Flex width="100%" ml="auto" justifyContent="space-between">
          <ConfirmEmail>
            {props => <ConfirmYourEmailHeader {...props} />}
          </ConfirmEmail>
        </Flex>
      )}
      Else={() =>
        !is_premium && (
          <Flex width="100%" p={3} pt={0}>
            <Text fontWeight="bold" fontSize={1} color={colors.fg}>
              <Branch
                if={traffic_max === ACCOUNT_PLAN.UNLIMITED}
                Then={() => t('Unlimited')}
                Else={() =>
                  parseFloat(remainingDataBytes) < 0
                    ? t('Out of data')
                    : `${remainingDataBytes} ${t('Left')}`
                }
              />
            </Text>
            <Flex ml="auto">
              {username ? (
                <WebLink
                  solid
                  ml="auto"
                  color={colors.primary}
                  onClick={() =>
                    websiteLink({
                      path: 'upgrade',
                      params: { pcpid: 'upgrade_ext1' },
                    })
                  }
                >
                  <Text fontSize={1}>{t('Upgrade')}</Text>
                </WebLink>
              ) : is_premium ? (
                <InlineButton
                  solid
                  ml="auto"
                  color={colors.primary}
                  onClick={() =>
                    websiteLink({
                      path: 'signup',
                      includeHash: false,
                      params: {
                        ghost_token: session_auth_hash,
                        cpid: cpid,
                        platform: platform,
                      },
                    })
                  }
                >
                  <Text fontSize={1}>{t('Claim your account')}</Text>
                </InlineButton>
              ) : (
                <InlineButton
                  solid
                  ml="auto"
                  color={colors.primary}
                  onClick={() => dispatch(actions.view.set('Signup'))}
                >
                  <Text fontSize={1}>{t('Get more data')}</Text>
                </InlineButton>
              )}
            </Flex>
          </Flex>
        )
      }
    />
  )
}
