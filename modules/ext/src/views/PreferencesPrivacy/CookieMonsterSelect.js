import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from '@rebass/emotion'
import CheckmarkIcon from 'assets/checkmark-icon.svg'
import { CookieMonsterSelectContainer, CookieMonsterButton } from './styles'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const CmButton = ({ children, ...props }) => {
  const { colors } = useTheme(ThemeContext)
  return (
    <CookieMonsterButton {...props} css={{ height: '18px' }}>
      <Text fontSize={'14px'}>{children}</Text>
      {props.active && (
        <Box>
          <CheckmarkIcon fill={colors.fg} />
        </Box>
      )}
    </CookieMonsterButton>
  )
}

// TODO: no margin auto

const CookieMonsterSelect = ({ checked, onlyThirdParty, changeMode }) => {
  const { t } = useTranslation()

  return (
    <CookieMonsterSelectContainer role="listbox" mt={'16px'} visible={checked}>
      <Box>
        <CmButton
          role="option"
          aria-selected={onlyThirdParty}
          active={onlyThirdParty}
          onClick={changeMode}
        >
          {t('3rd Party Cookies')}
        </CmButton>
      </Box>
      <Box>
        <CmButton
          role="option"
          aria-selected={!onlyThirdParty}
          active={!onlyThirdParty}
          onClick={changeMode}
        >
          {t('All Cookies')}
        </CmButton>
      </Box>
    </CookieMonsterSelectContainer>
  )
}

export default CookieMonsterSelect
