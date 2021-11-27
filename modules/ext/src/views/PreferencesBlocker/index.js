import React from 'react'
import { css } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import { Scrollbars } from 'react-custom-scrollbars'
import BlockerSettings from './BlockerSettings'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Box, Flex } from '@rebass/emotion'
import { SettingHeader } from 'components/Settings'

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()

  return (
    <Flex flexDirection="column" bg={colors.bg}>
      <SettingHeader prefName={t('Blocker')} role="tablist" />
      <Box
        ml={3}
        mt={2}
        css={css`
          div.setting-item-container {
            padding-top: 0px;
          }

          div.setting-item-container ~ div.setting-item-container {
            padding-top: 16px;
          }
        `}
      >
        <Scrollbars
          style={{ height: 350 }}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{ ...style, backgroundColor: colors.scrollBar }}
            />
          )}
        >
          <BlockerSettings />
        </Scrollbars>
      </Box>
    </Flex>
  )
}
