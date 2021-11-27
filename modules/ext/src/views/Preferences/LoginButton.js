import React from 'react'
import { useTranslation } from 'react-i18next'
import { SimpleButton } from 'ui/Button'
import Tooltip from 'ui/Tooltip'
import styled from '@emotion/styled'
import InfoIconSvg from 'assets/info-icon.svg'
import { Box } from 'rebass'
import { actions } from 'state'
import { useDispatch, useConnect } from 'ui/hooks'
import websiteLink from 'utils/websiteLink'
import { IS_CHROME } from 'utils/constants'

const InfoIcon = styled(InfoIconSvg)`
  position: absolute;
  right: 25px;
  bottom: 25px;
  path {
    fill: ${({ theme }) => theme.colors.white};
    fill-opacity: 0.404;
  }
`

const LoginButton = styled(SimpleButton)`
  ${({ theme }) => `
  width: 132px;
  height: 32px !important;
  border-radius:20px;
  color: ${theme.colors.white};
  border: 0px !important;
  background-color: ${theme.colors.primary} !important;
  font-size: ${theme.fontSizes[1]} !important ; 
  
  &:hover,
  &:focus{
    background-color: ${theme.colors.fg} !important;
    color:${theme.colors.bg};
    svg{
      path{
        fill:${theme.colors.bg};
      }
    }
  }
 `}
`
export default () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const session = useConnect(s => s.session)
  const isPaid = session.is_premium || session.alc?.length > 0 ? true : false
  const cpid = IS_CHROME ? 'ext_chrome' : 'ext_firefox'
  const platform = IS_CHROME ? 'chrome' : 'firefox'

  return isPaid ? (
    <LoginButton
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
      <Box>
        <span>{t('Claim')}</span>
        <Tooltip
          a11y={false}
          maxWidth="200px"
          message={t('Claim your account to prevent loss of purchases')}
        >
          <span>
            <InfoIcon />
          </span>
        </Tooltip>
      </Box>
    </LoginButton>
  ) : (
    <LoginButton onClick={() => dispatch(actions.view.set('Login'))}>
      <Box>
        <span>{t('Login')}</span>
        <Tooltip
          a11y={false}
          maxWidth="200px"
          message={t(
            'Login to view your account details and safeguard your preferences',
          )}
        >
          <span>
            <InfoIcon />
          </span>
        </Tooltip>
      </Box>
    </LoginButton>
  )
}
