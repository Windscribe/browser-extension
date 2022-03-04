import React from 'react'
import { Flex, Box, Text } from '@rebass/emotion'
import { ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { useTranslation } from 'react-i18next'
import websiteLink from 'utils/websiteLink'
import InfoLinkIcon from 'assets/settingIcons/infoLink.svg'

export default ({
  title = '',
  subHeading,
  path,
  Icon,
  alignCenter = true,
  children,
}) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()

  return (
    <Box
      css={{
        marginBottom: '16px',
        border: subHeading ? `solid 1px ${colors.bgLight}` : 'none',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
      aria-label={t(`${title}. ${subHeading || ''}`)}
    >
      <Box
        css={{
          width: '100%',
          backgroundColor: colors.bgLight,
          minHeight: '48px',
          padding: '14px 16px 0 16px',
          borderRadius: '8px',
        }}
      >
        <Flex
          css={{
            justifyContent: 'space-between',
            alignItems: alignCenter ? 'center' : 'none',
          }}
        >
          <Flex css={{ alignItems: alignCenter ? 'center' : 'none' }}>
            <Icon fill={colors.fg} />
            <Flex
              css={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.fg,
                paddingLeft: '16px',
                height: '20px',
                alignItems: 'center',
              }}
            >
              {t(title)}
            </Flex>
          </Flex>
          <Flex css={{ alignItems: alignCenter ? 'center' : 'none' }}>
            {children}
          </Flex>
        </Flex>
      </Box>
      {subHeading && (
        <Flex
          css={{
            padding: '10px 16px 8px 16px',
            justifyContent: 'space-between',
          }}
        >
          <Text
            css={{
              fontSize: '12px',
              color: colors.fgLight,
            }}
          >
            {t(subHeading)}
          </Text>
          {path && (
            <Box aria-label={t(title)} onClick={() => websiteLink({ path })}>
              <InfoLinkIcon
                fill={colors.fgLight}
                css={{
                  transition: '0.3s',
                  marginLeft: '12px',
                  cursor: 'pointer',
                  ':hover': {
                    fill: colors.fg,
                  },
                }}
              />
            </Box>
          )}
        </Flex>
      )}
    </Box>
  )
}
