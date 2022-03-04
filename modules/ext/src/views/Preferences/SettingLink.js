import React from 'react'
import { Flex, Box } from '@rebass/emotion'
import { ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { useTranslation } from 'react-i18next'
import { WebLink } from 'components/Button'
import ExternalLinkIcon from 'assets/external-link-icon.svg'

export default ({ title = '', openLink }) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()

  return (
    <Box
      css={{
        marginBottom: '16px',
        border: `solid 1px ${colors.bgLight}`,
        borderRadius: '8px',
      }}
    >
      <WebLink aria-label={t(title)} onClick={() => openLink()} width={'100%'}>
        <Flex
          css={{
            color: colors.fg,
            width: '100%',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '48px',
            padding: '0 16px',
            fontSize: '14px',
            fontWeight: '600',
            paddingLeft: '16px',
            alignItems: 'center',
          }}
        >
          {t(title)}
          <ExternalLinkIcon fill={colors.fg} />
        </Flex>
      </WebLink>
    </Box>
  )
}
