import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'
import styled from '@emotion/styled'
import { SimpleButton } from 'ui/Button'
import websiteLink from 'utils/websiteLink'

const LoginButton = styled(SimpleButton)`
  ${({ theme, enabled }) => `
  width: 103px;
  height: 40px;
  border-radius:20px;
  background-color: ${enabled ? theme.colors.green : theme.colors.iconBg};
  font-size: ${theme.fontSizes[1]} ; 
  margin-right:${theme.space[2]};
  margin-bottom:${theme.space[3]}
  ${
    enabled
      ? `&:hover,
  &:focus{
    background-color: ${theme.colors.fg};
    color:${theme.colors.bg};
  }`
      : ''
  }
 `}
`

const TextButton = styled(SimpleButton)`
  ${({ theme }) => `
    font-size: ${theme.fontSizes[1]};
    color: ${theme.colors.fgLight};
    padding-bottom:${theme.space[2]};
    vertical-align: center;
    &:hover,&:focus{
      color: ${theme.colors.fg};
    }
    
  
`}
`
export default ({ enableLogin, is2FA, toggle2FA }) => {
  const { t } = useTranslation()
  return (
    <Flex flexDirection="row-reverse" justifyContent="space-between" pt={2}>
      <LoginButton
        type="submit"
        tabIndex={0}
        aria-label="Login"
        enabled={enableLogin}
      >
        {t('Login')}
      </LoginButton>
      <Flex flexDirection="column" alignItems="flex-start">
        {is2FA ? (
          <div style={{ height: '12px' }} />
        ) : (
          <TextButton name="open2FA" type="button" onClick={toggle2FA}>
            {t('2FA Code?')}
          </TextButton>
        )}
        <TextButton
          type="button"
          onClick={() => websiteLink({ path: 'forgotpassword' })}
        >
          {t('Forgot password?')}
        </TextButton>
      </Flex>
    </Flex>
  )
}
