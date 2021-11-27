import React, { useEffect, useState } from 'react'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { css } from '@emotion/core'
import Button from 'ui/Button'
import { WebLink } from 'components/Button'
import ErrorIcon from 'assets/attention-icon.svg'
import websiteLink from 'utils/websiteLink'
import writeTextToClipboard from 'utils/writeTextToClipboard'

const ACTIVITY = 'critical_error'

const CenterCol = props => (
  <Flex
    {...props}
    alignItems="center"
    flexDirection="column"
    justifyContent="center"
  />
)

const ViewButtons = ({ noReload }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { colors } = useTheme(ThemeContext)
  const sendDebugLog = () =>
    dispatch(actions.debugLog.send({ logActivity: ACTIVITY }))
  const [debugLogSent, setDebugLogSent] = useState(false)
  return (
    <Flex flexDirection="column">
      {!noReload && (
        <Box mb={3}>
          <Button
            css={css`
              width: 100%;
            `}
            lg
            onClick={() => {
              dispatch({ type: 'RESET_ALL' })
            }}
          >
            {t('Reset Extension')}
          </Button>
        </Box>
      )}
      <Box mb={1}>
        <WebLink
          onClick={() => websiteLink({ path: 'support' })}
          css={css`
            margin: auto;
          `}
        >
          <Text fontSize={1}>{t('Contact support')}</Text>
        </WebLink>
        {debugLogSent ? (
          <Text
            aria-live="polite"
            fontSize={0}
            color={colors.halfblack}
            css={css`
              text-align: center;
            `}
          >
            {t('Debug Log sent!')}
          </Text>
        ) : (
          <WebLink
            onClick={() => {
              sendDebugLog()
              setDebugLogSent(true)
            }}
            color={colors.halfblack}
            css={css`
              margin: auto;
            `}
          >
            <Text fontSize={1}>{t('Send Debug Log')}</Text>
          </WebLink>
        )}
      </Box>
    </Flex>
  )
}

export default ({ error, alert, noReload = false }) => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  function copyError(event) {
    if (event.key === 'c') {
      writeTextToClipboard(error)
    }
  }

  useEffect(() => {
    window.addEventListener('keypress', copyError)
    return () => {
      window.removeEventListener('keypress', copyError)
    }
  })

  return (
    <CenterCol
      bg={colors.white}
      css={css`
        height: 100%;
        & > * {
          margin: 10px;
        }
      `}
    >
      <CenterCol>
        <ErrorIcon fill={colors.black} />
        <Text
          mt={3}
          mb={2}
          css={css`
            width: 13rem;
          `}
          fontSize={1}
          textAlign="center"
        >
          {alert ||
            t(
              'The extension has encountered an unrecoverable error. Reset to start fresh (all local extension data will be wiped).',
            )}
        </Text>
      </CenterCol>

      <ViewButtons noReload={noReload} />
    </CenterCol>
  )
}
