import React, { createContext, useState } from 'react'
import { Box } from '@rebass/emotion'
import { css } from '@emotion/core'
import SiteControlRow from './SiteControlRow'
// import SecureLinkButton from './SecureLinkButton'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

export const DomainBarContext = createContext()

export default () => {
  const { colors } = useTheme(ThemeContext)
  const [showingAllowlist, setShowingAllowlist] = useState(false)
  const [shouldReload, setShouldReload] = useState(false)
  const { t } = useTranslation()

  return (
    <DomainBarContext.Provider
      value={{
        showingAllowlist,
        setShowingAllowlist,
        shouldReload,
        setShouldReload,
      }}
    >
      <Box
        bg={colors.darkgrey}
        tabIndex={0}
        aria-label={t('Domain Details')}
        css={css`
          z-index: 1;
          display: grid;
          min-height: 50px;
        `}
      >
        <SiteControlRow />
        {/* <Flex
          flexDirection="column"
          css={css`
            z-index: 100;
          `}
        >
          <SecureLinkButton
            css={css`
              margin: 0px ${space[3]} ${space[3]} ${space[3]};
              width: 90%;
            `}
          />
        </Flex> */}
      </Box>
    </DomainBarContext.Provider>
  )
}
