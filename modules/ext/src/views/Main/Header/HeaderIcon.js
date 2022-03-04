import React from 'react'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'
import { Flex } from '@rebass/emotion'
import { ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'

export default ({ Icon, view, count, className, primaryBgColor }) => {
  const dispatch = useDispatch()

  const { colors } = useTheme(ThemeContext)
  return (
    <Flex
      onClick={() => dispatch(actions.view.set(view))}
      css={{
        position: 'relative',
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        background: primaryBgColor,
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        fill: colors.halfwhite,
        transition: '0.3s',
        ':hover': {
          fill: colors.white,
          transform: 'scale(1.1)',
        },
      }}
      className={className}
    >
      <Icon />
      <Flex
        css={{
          position: 'absolute',
          borderRadius: '50%',
          height: '14px',
          width: '14px',
          right: '-4px',
          bottom: '-2px',
          backgroundColor: colors.lightGreen,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flex
          css={{
            paddingTop: '1px',
            fontSize: '9px',
            color: colors.green,
            fontWeight: '700',
            lineHeight: '0',
          }}
        >
          {count}
        </Flex>
      </Flex>
    </Flex>
  )
}
