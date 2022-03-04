import React, { Flex, Box } from '@rebass/emotion'
import { ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { Scrollbars } from 'react-custom-scrollbars'
import { SettingHeader } from 'components/Settings'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'ui/hooks'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.activeTabId,
  (...args) => args,
)

export default ({ title = '', showReloadAlert, setReloadAlert, children }) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const [activeTabId] = useConnect(selector)

  return (
    <Flex flexDirection="column" bg={colors.bg}>
      <Flex
        onClick={() => {
          browser.tabs.reload(activeTabId).then(() => setReloadAlert(false))
        }}
        css={{
          visibility: showReloadAlert ? 'visible' : 'hidden',
          opacity: showReloadAlert ? 1 : 0,
          transition: '0.3s',
          zIndex: '999',
          background: colors.orange,
          color: colors.white,
          boxShadow: `0 2px 5px 0 ${colors.quarterblack}`,
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '7px 16px',
          borderRadius: '30px',
          fontSize: '12px',
          cursor: 'pointer',
          lineHeight: 'normal',
          ':hover': {
            background: colors.black,
          },
        }}
      >
        {t('Refresh to see changes')}
      </Flex>
      <SettingHeader prefName={t(title)} role="tablist" />
      <Scrollbars
        autoHeight={true}
        autoHeightMax={402}
        renderThumbVertical={({ style, ...props }) => (
          <div
            {...props}
            style={{ ...style, backgroundColor: colors.scrollBar }}
          />
        )}
      >
        <Box mt={'8px'} mx={3}>
          {children}
        </Box>
      </Scrollbars>
    </Flex>
  )
}
