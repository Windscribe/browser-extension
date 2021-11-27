import styled from '@emotion/styled'
import { Box } from '@rebass/emotion'
import Button, { SimpleButton, InlineButton } from 'ui/Button'

export const Menu = styled(Box)`
  position: relative;
  bottom: 0;
  background: ${({ theme }) => theme.colors.bg};
`

export const MenuItem = styled(SimpleButton)`
  padding: 16px 16px 16px 0px;    
  width: 100%;
  border-bottom: 2px solid ${({ theme }) => theme.colors.divider};
  cursor: pointer;
  display: flex;

  svg {
    transition: fill ease 0.3s;
  }

  &:last-child {
    margin-bottom: ${({ theme }) => theme.space[2]};
  }

  &:hover
    svg {
      fill: ${({ active = false, theme }) =>
        active ? theme.colors.primary : theme.colors.inactive}
    }
  }
`
export const DeleteButton = styled(Button)`
  flex: 1;
  margin-left: ${({ theme }) => theme.space[1]};
  background-color: ${({ theme }) => theme.colors.red};
  &:hover {
    background: ${({ theme }) => theme.colors.redLight};
  }
`

export const SaveButton = styled(Button)`
  flex: 1;
  margin-left: ${({ theme }) => theme.space[1]};
  ${({ disabled, theme }) =>
    disabled
      ? {
          background: theme.colors.iconBg,
          borderColor: 'transparent',
          color: theme.colors.bg,
        }
      : {
          background: theme.colors.primary,
          color: theme.colors.white,
        }};
  &:hover {
    background: ${({ theme }) => theme.colors.primarylight};
  }
`

export const ActionButton = styled(InlineButton)`
  height: 32px;
  width: 32px;
  /* account for icon offset */
  margin-right: -4px;
  svg {
    transition: fill ease 0.3s;
  &:hover {
    svg {
      fill: ${({ theme }) => theme.colors.darkGrey};
    }
  }
`
