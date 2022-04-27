import React from 'react'
import { Flex } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'

export default ({ type, value, current, ACTIVITY }) => {
  const dispatch = useDispatch()
  const { colors } = useTheme(ThemeContext)
  return (
    <Flex
      onClick={() => {
        dispatch(
          actions[type].setandlog({
            value: value,
            logActivity: ACTIVITY,
          }),
        )
      }}
      aria-label={value}
      css={{
        color: current ? colors.primary : colors.truehalfblack,
        fontWeight: '700',
        borderRadius: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 'normal',
        fontSize: '12px',
        height: '23px',
        '&:hover': {
          backgroundColor: colors.truenanoblack,
        },
        cursor: 'pointer',
        padding: '0 4px',
      }}
    >
      {value}
    </Flex>
  )
}
