import React from 'react'
import { Box, Flex, Text } from 'rebass'
import { OverrideAppHeight } from 'components/Utils'
import Header from 'components/LoginHeader'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import Button from './Button'

export default () => {
  const { colors, space, fontSizes } = useTheme(ThemeContext)
  const { t } = useTranslation()
  return (
    <Box bg={colors.bg}>
      <OverrideAppHeight height={'0px'} />
      <Flex flexDirection="column">
        <Header headerText="Sign up" buttonText="Login" buttonView="Login" />
        <Flex flexDirection="column">
          <Text
            color={colors.fg}
            pt={space[6]}
            fontSize={fontSizes[1]}
            textAlign="center"
          >
            {t('Pick your plan')}
          </Text>
          <Box mx={space[8]} my={space[6]}>
            <Button
              bgColor={colors.divider}
              color={colors.fg}
              text="Free"
              subtext="Up to 10GB/month"
              path="signup"
            />
          </Box>
          <Box mx={space[8]} mb={space[6]}>
            <Button
              bgColor={colors.green}
              color={colors.black}
              text="Pro"
              subtext="Unlimited GB & more"
              path="upgrade"
              isPro
            />
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
