import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'ui/hooks'
// eslint-disable-next-line no-unused-vars
import { Flex, Box, Text } from '@rebass/emotion'
import { LinkIconButton } from 'components/Button'
import Tooltip from 'ui/Tooltip'
import websiteLink from 'utils/websiteLink'
import BookIcon from 'assets/book.svg'
import HelpIcon from 'assets/help-icon-no-circle.svg'
import { actions } from 'state'
import LogoutButton from './LogoutButton'
import styled from '@emotion/styled'
import { THEME_MAP } from 'utils/constants'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import LoginButton from './LoginButton'

const selector = createSelector(
  s => s?.theme,
  (...args) => args,
)

const LinkIconButtonThemed = styled(LinkIconButton)`
  background: ${({ theme }) => theme.colors.iconBg} !important;
  path {
    transition: 0.3s;
    fill: ${({ theme }) => theme.colors.fgLight} !important;
  }
  &:hover {
    path {
      fill: ${({ theme }) => theme.colors.fg} !important;
    }
  },
}}
`

// eslint-disable-next-line no-unused-vars
export default ({ lang, isGhost }) => {
  const [themeName] = useSelector(selector)
  const { icon: ThemeIcon } = THEME_MAP.get(themeName)

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const setView = v => dispatch(actions.view.set(v))

  const restartOnboarding = () => {
    dispatch(actions.showOnboarding.set(true))
    setView('Main')
  }

  return (
    <Flex m={3} flex={1} justifyContent="space-between" alignItems="center">
      <Flex flex={1} m={`0 auto 0 0`}>
        {/* TODO: Add this back in when languages actually work  */}
        {/* <Box mr={3}>
          <Tooltip a11y={false} message={t('Change Language')}>
            <span>
              <LinkIconButton
                aria-label={`Change Language: ${lang.split('').join(' ')}`}
                onClick={() => setView('PreferencesLanguage')}
              >
                <Text fontSize={0} fontWeight={700}>
                  {lang.toUpperCase()}
                </Text>
              </LinkIconButton>
            </span>
          </Tooltip>
        </Box> */}

        <Tooltip a11y={false} message={t('Change Theme')}>
          <span>
            <LinkIconButtonThemed
              aria-label={t('Change Theme')}
              onClick={() => dispatch(actions.theme.next())}
            >
              <ThemeIcon />
            </LinkIconButtonThemed>
          </span>
        </Tooltip>

        <Tooltip a11y={false} message={t('Restart OnBoarding')}>
          <Box ml={3}>
            <span>
              <LinkIconButtonThemed
                aria-label={t('RestartOnboarding')}
                onClick={restartOnboarding}
              >
                <BookIcon />
              </LinkIconButtonThemed>
            </span>
          </Box>
        </Tooltip>
        <Tooltip a11y={false} message={t('Get Support')}>
          <Box ml={3}>
            <span>
              <LinkIconButtonThemed
                aria-label={t('Get Support')}
                onClick={() => websiteLink({ path: 'support' })}
              >
                <HelpIcon />
              </LinkIconButtonThemed>
            </span>
          </Box>
        </Tooltip>
      </Flex>
      {isGhost ? <LoginButton /> : <LogoutButton />}
    </Flex>
  )
}
