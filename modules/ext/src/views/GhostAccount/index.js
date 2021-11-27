import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'rebass'
import { useTheme, useDispatch, useConnect } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { SimpleButton } from 'ui/Button'
import styled from '@emotion/styled'
import { actions } from 'state'
import { SettingHeader } from 'components/Settings'
import websiteLink from 'utils/websiteLink'
import { IS_CHROME } from '../../utils/constants'

const SignUpButton = styled(SimpleButton)`
  ${({ theme }) => `
    font-size: ${theme.fontSizes[1]};
    background-color: ${theme.colors.green};
    border-radius: 20px;
    margin: 24px 93px 16px 93px;
    padding: 11px;
    &:hover{
        color: ${theme.colors.bg};
        background-color:${theme.colors.fg};
    }
`}
`
const LoginButton = styled(SimpleButton)`
  ${({ theme }) => `
    color: ${theme.colors.fgLight};
    font-size: ${theme.fontSizes[1]};
    border-radius: 20px;
    padding: 11px;
    margin: 0 93px 55px 93px;
    &:hover{
        color: ${theme.colors.bg};
        background-color:${theme.colors.fg};
    }
`}
`
export default () => {
  const { colors, space, fontSizes } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const session = useConnect(s => s.session)
  const { t } = useTranslation()
  const goto = view => dispatch(actions.view.set(view))
  const isPaid = session.is_premium || session.alc?.length > 0 ? true : false
  const cpid = IS_CHROME ? 'ext_chrome' : 'ext_firefox'
  const platform = IS_CHROME ? 'chrome' : 'firefox'

  return (
    <>
      <Box bg={colors.bg}>
        <Flex flexDirection="column" height={'300px'}>
          <SettingHeader prefName={t('Account')}></SettingHeader>
          <Text
            color={colors.fg}
            mx={space[14]}
            mt={space[14]}
            fontSize={fontSizes[1]}
            textAlign="center"
          >
            {t(
              isPaid
                ? 'Claim your account to prevent loss of purchases'
                : 'Sign up or login to view your account details and safeguard your preferences',
            )}
          </Text>
          {isPaid ? (
            <SignUpButton
              onClick={() =>
                websiteLink({
                  path: 'signup',
                  includeHash: false,
                  params: {
                    ghost_token: session.session_auth_hash,
                    cpid: cpid,
                    platform: platform,
                  },
                })
              }
            >
              {t('Claim')}
            </SignUpButton>
          ) : (
            <>
              <SignUpButton onClick={() => goto('Signup')}>
                {t('Sign up')}
              </SignUpButton>
              <LoginButton onClick={() => goto('Login')}>
                {t('Login')}
              </LoginButton>
            </>
          )}
        </Flex>
      </Box>
    </>
  )
}
