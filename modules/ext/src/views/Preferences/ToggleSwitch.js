import React from 'react'
import { Box } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { WithToolTip } from 'components/Utils'
import { useTranslation } from 'react-i18next'
import { delay } from 'utils/delay'

export default ({ toggleValue, disabled, onToggle }) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()

  return (
    <WithToolTip tip={disabled && t('Not available in Autopilot')}>
      <Box
        css={{
          height: '20px',
          maxWidth: '36px',
          minWidth: '36px',
          borderRadius: '10px',
          backgroundColor: toggleValue ? colors.primary : colors.white,
          padding: '2px',
          transition: 'background-color .3s',
          opacity: disabled ? 0.3 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={async () => {
          if (!disabled) {
            onToggle()
            await delay(250)
          }
        }}
      >
        <Box
          css={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: toggleValue ? colors.white : colors.black,
            transform: `translate(${toggleValue ? '16px' : '0'})`,
            transition: 'transform .3s, background-color .3s',
          }}
        />
      </Box>
    </WithToolTip>
  )
}
