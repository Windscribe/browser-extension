// @ts-nocheck
import React from 'react'
import { Flex } from '@rebass/emotion'
import SortGeography from 'assets/sortingIcons/sort-geography.svg'
import SortAlphabet from 'assets/sortingIcons/sort-alphabet.svg'
import { HeaderMenuItem } from 'components/Settings'
import { css } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

export default function SortButton({ sortBy, onClick }) {
  if (!['geography', 'alphabet'].includes(sortBy)) {
    throw new Error('invalid `sortBy` parameter: "' + sortBy + '"')
  }

  const { colors } = useTheme(ThemeContext)

  const SortIcon = () => (
    <Flex
      aria-label={`Sort by ${sortBy}`}
      ml="auto"
      css={css`
        & > svg > path {
          fill: ${colors.fg};
        }
      `}
    >
      {sortByIcons[sortBy]}
    </Flex>
  )

  return (
    <Flex
      css={css`
        width: 100%;
      `}
    >
      <HeaderMenuItem
        css={css`
          margin-left: auto;
        `}
        solid={true}
        role="tab"
        onClick={onClick}
      >
        <SortIcon />
      </HeaderMenuItem>
    </Flex>
  )
}

const sortByIcons = {
  geography: <SortGeography />,
  alphabet: <SortAlphabet />,
}
