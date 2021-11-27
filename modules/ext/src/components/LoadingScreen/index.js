import React from 'react'
import { Flex } from '@rebass/emotion'
import WsBadge from 'assets/splash/ws-rotating-logo2.gif'
import { css } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Text } from 'rebass'

export default ({ text }) => {
  const { colors } = useTheme(ThemeContext)

  return (
    <Flex
      css={css`
        position: absolute !important;
        height: 100vh;
        width: 100vw;
        pointer-events: none;
        transition: opacity 0.3s ease-out;
      `}
      bg={colors.darkgrey}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <img height={60} width={60} src={WsBadge} alt="logo" />
      <Text
        aria-live="polite"
        css={css`
          position: absolute;
          bottom: 25px;
        `}
        color={colors.white}
        fontSize={2}
      >
        {text}
      </Text>
    </Flex>
  )
}
