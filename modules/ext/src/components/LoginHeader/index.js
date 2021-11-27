import React from 'react'
import { css } from '@emotion/core'
import { useConnect, useTheme, useDispatch } from 'ui/hooks'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from '@emotion/core'
import styled from '@emotion/styled'
import { actions } from 'state'
import { Flex, Text } from 'rebass'
import LeftArrow from 'assets/left-arrow-icon.svg'
import { IconButton, SimpleButton } from 'ui/Button'

const HeaderButton = styled(SimpleButton)`
  color: ${({ theme }) => theme.colors.fg};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  &:focus {
    opacity: 1;
  }
  margin: 8px 0;
`
export default ({ headerText, buttonText, buttonView }) => {
  const dispatch = useDispatch()
  const view = useConnect(s => s.view)
  const { t } = useTranslation()
  const { colors, fontSizes, space, fontWeights } = useTheme(ThemeContext)
  const [prevPage] = view.previous.reverse()
  const buttonHandler = () => dispatch(actions.view.set(buttonView))
  const goBack = () => dispatch(actions.view.back())
  return (
    <Flex
      flexDirection="row"
      justifyContent="space-between"
      p={3}
      sx={{
        borderBottom: `2px solid ${colors.divider}`,
      }}
    >
      <IconButton
        aria-label={t(`Back to ${prevPage}`)}
        onClick={goBack}
        css={css`
          background-color: ${colors.iconBg} !important;
          svg {
            width: 12px;
            height: 16px; /* ff weirdness */
          }
          &:focus {
            border: 1px solid ${colors.iconBg};
          }
        `}
      >
        <LeftArrow
          css={css`
            path {
              fill: ${colors.fg};
            }
          `}
        />
      </IconButton>
      <Text
        color={colors.fg}
        height={space[8]}
        fontSize={fontSizes[4]}
        fontWeight={fontWeights[1]}
      >
        {t(headerText)}
      </Text>
      <HeaderButton onClick={buttonHandler}>{t(buttonText)}</HeaderButton>
    </Flex>
  )
}
