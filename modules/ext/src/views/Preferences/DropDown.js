import React, { useRef } from 'react'
import { css } from '@emotion/core'
import { Box, Flex, Text } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import DropDownItem from './DropDownItem'
import DoubleArrowIcon from 'assets/double-arrow-icon.svg'

export default ({ type, current, items, ACTIVITY }) => {
  const { colors } = useTheme(ThemeContext)
  const dropDown = useRef(null)

  return (
    <>
      <Flex
        css={css`
          color: ${colors.fgLight};
          align-items: center;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          &:hover + .${type} {
            opacity: 1;
            visibility: visible;
          }
        `}
      >
        <Text mr={'8px'}>{current}</Text>
        <DoubleArrowIcon fill={colors.fgLight} />
      </Flex>
      <Box
        css={{
          transition: 'visibility 0.3s, opacity 0.3s',
          opacity: '0',
          visibility: 'hidden',
          position: 'relative',
          ':hover': {
            opacity: '1',
            visibility: 'visible',
          },
        }}
        className={type}
      >
        <Box
          ref={dropDown}
          py={'4px'}
          px={'4px'}
          css={{
            position: 'absolute',
            backgroundColor: colors.white,
            borderRadius: '4px',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            border: `solid 1px ${colors.truemicroblack}`,
            width: 'auto',
            minWidth: '60px',
            whiteSpace: 'nowrap',
            boxShadow: `0 2px 4px 0 ${colors.truemicroblack}`,
          }}
        >
          {items.map(item => (
            <DropDownItem
              key={item}
              type={type}
              value={item}
              current={current === item ? true : false}
              ACTIVITY={ACTIVITY}
            />
          ))}
        </Box>
      </Box>
    </>
  )
}
