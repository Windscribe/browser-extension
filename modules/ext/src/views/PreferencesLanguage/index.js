import React from 'react'
import { useDispatch, useConnect } from 'ui/hooks'
import { actions } from 'state'
import { Box, Flex } from '@rebass/emotion'
import { css } from '@emotion/core'
import { SettingHeader, SettingsMenuItem } from 'components/Settings'
import CheckIcon from 'assets/checkmark-icon.svg'
import { ACTIVE_LANGUAGES_MAP } from 'utils/constants'
import { getNativeName } from 'utils/isoLanguagesList'

export default () => {
  const language = useConnect(s => s.language)
  const dispatch = useDispatch()
  const setLanguage = l => dispatch(actions.language.set(l))

  // note these are just example languages I chose
  return (
    <Flex
      flexDirection="column"
      bg={'white'}
      css={css`
        height: 100%;
      `}
    >
      <SettingHeader prefName={'Languages'} />
      <Box mx={3}>
        {Object.keys(ACTIVE_LANGUAGES_MAP).map(lang => (
          <SettingsMenuItem
            key={lang}
            isActive={lang === language}
            ActiveIcon={CheckIcon}
            title={getNativeName(lang)}
            onClick={() => {
              setLanguage(lang)
            }}
          />
        ))}
      </Box>
    </Flex>
  )
}
