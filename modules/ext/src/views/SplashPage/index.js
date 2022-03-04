import React from 'react'
import { Flex } from 'rebass'
import { useTheme, useDispatch, useConnect } from 'ui/hooks'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from '@emotion/core'
import websiteLink from 'utils/websiteLink'
import Header from './Header'
import { SimpleButton } from 'ui/Button'
import styled from '@emotion/styled'
import { actions } from 'state'
import LoadingScreen from 'components/LoadingScreen'
import splashbg from 'assets/splash/desksplashpng.png'

const GetStartedButton = styled(SimpleButton)`
  margin: 52px auto 0px;
  padding: 9px 54px;
  color: #020d1c;
  background-color: #55ff8a;
  border: none;
  border-radius: 20px;
  height: 40px;
  width: 228px;
  font-size: 14px;
  &:hover {
    background-color: white;
  }
`

const LoginButton = styled(SimpleButton)`
  width: 50%;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  font-size: ${({ theme }) => theme.fontSizes[1]};
  font-weight: ${({ theme }) => theme.fontWeights[1]};
  margin: 25px auto;
`

export default ({ home = () => websiteLink({ path: '/' }) }) => {
  const { colors } = useTheme(ThemeContext)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const loggingIn = useConnect(s => s.loggingIn)
  const ghostAccount = () => dispatch(actions.ghost.login())
  const loginClick = () => dispatch(actions.view.set('Login'))

  return (
    <>
      {loggingIn ? (
        <LoadingScreen text={t('Logging you in...')} />
      ) : (
        <>
          <Flex
            color={colors.white}
            sx={{
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              backgroundImage: `url(${splashbg})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '324px 300px',
              // minHeight: '300px',
            }}
          >
            <Header home={home} />
            <GetStartedButton name="ghost" onClick={ghostAccount}>
              {t('Get Started')}
            </GetStartedButton>
            <LoginButton name="login" onClick={loginClick}>
              {t('Login')}
            </LoginButton>
          </Flex>
        </>
      )}
    </>
  )
}
