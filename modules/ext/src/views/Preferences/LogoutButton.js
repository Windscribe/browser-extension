import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'ui/hooks'
import { IconButton } from 'ui/Button'
import LogoutIcon from 'assets/logout-icon.svg'
import ToolTip from 'ui/Tooltip'
import { actions } from 'state'
import { Flex } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

export default props => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const logout = () =>
    dispatch(actions.auth.logout({ logActivity: 'logout_button' }))

  return (
    <ToolTip a11y={false} message={t('Log Out')}>
      <Flex {...props}>
        <IconButton
          aria-label={t('Log Out')}
          background={colors.red}
          onClick={() => logout()}
        >
          <LogoutIcon fill={colors.white} />
        </IconButton>
      </Flex>
    </ToolTip>
  )
}
