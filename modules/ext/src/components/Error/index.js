import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'
import { css } from '@emotion/core'
import Button from 'ui/Button'
import { Text, Flex } from '@rebass/emotion'
import ErrorIcon from 'assets/attention-icon.svg'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const Error = () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const back = () => dispatch(actions.view.back())

  return (
    <Flex
      bg={colors.white}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      css={css`
        height: 100%;
        & > * {
          margin: 10px;
        }
      `}
    >
      <ErrorIcon fill={colors.black} />
      <Text
        fontSize={0}
        css={css`
          width: 9rem;
        `}
        textAlign="center"
      >
        {t('Windscribe has encountered a problem. Please try again later.')}
      </Text>
      <Button onClick={back}>{t('Back')}</Button>
    </Flex>
  )
}
export default Error
