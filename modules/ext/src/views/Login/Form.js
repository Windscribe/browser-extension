import React, { useState, useEffect } from 'react'
import Textbox from './Textbox'
import Footer from './Footer'
import styled from '@emotion/styled'
import { useConnect, useDispatch, useTheme } from 'ui/hooks'
import { actions } from 'state'
import { debounce } from 'lodash'
import LoadingScreen from 'components/LoadingScreen'
import { useTranslation } from 'react-i18next'
import { createSelector } from 'reselect'
import { Text } from 'rebass'
import { ThemeContext } from '@emotion/core'
import { SimpleButton } from 'ui/Button'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space[2]};
`
const TextButton = styled(SimpleButton)`
  ${({ theme }) => `
    font-size: ${theme.fontSizes[1]};
    color: ${theme.colors.fgLight};
    padding:0 0;
    vertical-align: center;
    &:hover,&:focus{
      color: ${theme.colors.fg};
    }
    
  
`}
`

const TwoFAText = styled(Text)`
  font-size: 12px;
`

const selector = createSelector(
  s => s.session,
  s => s.loggingIn,
  s => s.expiredUsername,
  (...args) => args,
)
export default () => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [twoFACode, set2faCode] = useState('')
  const [errorMessage, setErrorMessage] = useState()
  const [twoFAError, set2FAError] = useState('')
  const dispatch = useDispatch()
  const [session, loggingIn, expiredUsername] = useConnect(selector)
  const [is2FA, set2FA] = useState(false)
  const toggle2FA = () => {
    set2FA(!is2FA)
  }
  const { colors } = useTheme(ThemeContext)
  const clearError = debounce(() =>
    dispatch(actions.session.assign({ error: null }), 500),
  )
  const login = info => dispatch(actions.auth.login(info))

  const saveUsername = async () => {
    browser.storage.local.get('user').then(({ user }) => {
      if (username || (user && !username)) {
        browser.storage.local.set({ user: username })
      }
    })
  }

  // cleanup error state when user naviagtes away
  useEffect(
    () => () => dispatch(actions.session.assign({ error: null }), 500),
    [dispatch],
  )
  //#region default username pwd for dev
  /* DEV Quality of life. Populate form with default creds provided by
    WEB_EXT_DEV_USERNAME
    WEB_EXT_DEV_PASSWORD
  */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setUsername(process.env.WEB_EXT_DEV_USERNAME || '')
      setPassword(process.env.WEB_EXT_DEV_PASSWORD || '')
    }

    browser.storage.local.get('user').then(({ user }) => {
      if (user) setUsername(user)
    })
  }, [])
  //#endregion

  useEffect(() => {
    set2FAError(undefined)
    setErrorMessage(undefined)
    if (session.error) {
      let msg = session.error.data?.errorMessage
      if (!msg) {
        msg = 'An unknown error occurred. Are you connected to the internet?'
      }
      //2FA error codes
      if (
        session.error.data?.errorCode === 1340 ||
        session.error.data?.errorCode === 1341
      ) {
        set2FA(true)
        set2FAError(msg)
      } else {
        setErrorMessage(msg)
      }
    }
  }, [session, expiredUsername])
  return loggingIn ? (
    <LoadingScreen text={t('Logging you in...')} />
  ) : (
    <Form
      onSubmit={e => {
        e.preventDefault()
        if (!!username && !!password) {
          login({ username, password, twoFACode })
        }
      }}
    >
      <Textbox
        value={username}
        name="username"
        setValue={setUsername}
        labelText={t('Username')}
        isInvalid={!!errorMessage}
        clearError={clearError}
        message={loggingIn ? t('Logging you in...') : t(errorMessage)}
        autoFocus
        readOnly={loggingIn}
        onChange={saveUsername()}
      />
      <Textbox
        value={password}
        name="password"
        setValue={setPassword}
        labelText={t('Password')}
        isInvalid={!!errorMessage}
        clearError={clearError}
        password
        readOnly={loggingIn}
      />
      {is2FA ? (
        <>
          <Textbox
            value={twoFACode}
            name="2FA"
            setValue={set2faCode}
            labelControl={
              <TextButton name="close2FA" type="button" onClick={toggle2FA}>
                {t('2FA Code')}
              </TextButton>
            }
            isInvalid={!!twoFAError}
            clearError={clearError}
            message={twoFAError}
            readOnly={loggingIn}
          />
          <TwoFAText color={colors.fgLight} width="180px" ml={2}>
            If enabled, use an authentication app to generate the code.
          </TwoFAText>
        </>
      ) : null}
      <Footer
        enableLogin={!!username && !!password && !loggingIn}
        toggle2FA={toggle2FA}
        is2FA={is2FA}
      />
    </Form>
  )
}
