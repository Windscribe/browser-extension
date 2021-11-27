import React from 'react'
import { ThemeContext } from '@emotion/core'
import { Flex, Box } from 'rebass'
import { OverrideAppHeight } from 'components/Utils'
import Header from 'components/LoginHeader'
import Form from './Form'
import { useTheme } from 'ui/hooks'

export default () => {
  const { colors } = useTheme(ThemeContext)

  return (
    <Box bg={colors.bg}>
      <OverrideAppHeight height={'300px'} />
      <Flex flexDirection="column">
        <Header headerText="Login" buttonText="Sign up" buttonView="Signup" />
        <Form />
      </Flex>
    </Box>
  )
}
