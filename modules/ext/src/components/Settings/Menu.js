import React from 'react'
import styled from '@emotion/styled'
import { InlineButton, SimpleButton } from 'ui/Button'
import { Box, Flex, Text } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import Arrow from 'assets/right-arrow-icon.svg'

export const HeaderMenuItem = styled(InlineButton)`
  padding: ${({ theme }) => theme.space[4]};
  padding-top: 0;
  position: relative;
  transition: background-color, opacity ease 0.3s;

  &:after {
    content: '';
    position: absolute;
    background-color: ${({ active = false, theme }) =>
      active ? theme.colors.fg : 'transparent'};
    height: 2px;
    bottom: -2px;
    left: ${({ theme }) => theme.space[4]};
    right: ${({ theme }) => theme.space[4]};
    transition: background-color ease 0.3s;
  }

  &:hover {
    opacity: ${({ active, selected }) => (active || selected ? 1 : 0.6)};
  }

  &:active {
    opacity: 1;
  }

  .header-text {
    text-transform: uppercase;
  }
`

const MenuItemContainer = styled(SimpleButton)`
  justify-content: space-between !important;
  width: 100%;
  padding: 16px;
  margin-top: 2px;
  border-bottom-width: 2px;
  border-bottom-style: solid;
  border-bottom-color: ${({ noBorder = false, theme }) =>
    !noBorder ? theme.colors.divider : 'transparent'};
  color: ${({ theme }) => theme.colors.fgLight};

  transition: color ease 0.5s, border ease 0.5s;

  .icon-container {
    fill: ${({ theme }) => theme.colors.fg};
    height: 16px;
    opacity: 0.3;
    transition: opacity ease 0.3s;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.fg};

    .icon-container {
      opacity: 1;
    }
  }

  .left-icon {
    fill: ${({ theme, iconFill }) => theme.colors[iconFill]};
  }
`

export const SettingsMenuItem = ({
  onClick,
  title,
  noBorder = false,
  IconLeft,
  iconLeftColor = 'iconFg',
  isActive = false,
  ActiveIcon,
}) => {
  const { colors } = useTheme(ThemeContext)
  return (
    <MenuItemContainer
      tabIndex={0}
      alignItems="center"
      onClick={onClick}
      iconFill={iconLeftColor}
      noBorder={noBorder}
      aria-label={title}
    >
      <Flex alignItems="center">
        {IconLeft && <IconLeft className="left-icon" />}
        <Text ml={IconLeft ? 3 : 0} fontSize={1} fontWeight="bold">
          {title}
        </Text>
      </Flex>
      <Box className={isActive ? 'active-icon-container' : 'icon-container'}>
        {isActive ? (
          <ActiveIcon fill={colors.primary} />
        ) : (
          <Arrow
            css={css`
              fill: ${colors.fg};
              height: 16px;
              width: 16px;
            `}
          />
        )}
      </Box>
    </MenuItemContainer>
  )
}
