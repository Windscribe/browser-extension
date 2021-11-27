import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { Flex } from '@rebass/emotion'
import Button, { SimpleButton } from 'ui/Button'

export const posedBoxStyle = css`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

export const WhiteListContainer = styled(Flex)`
  ${({ theme, height = '100%' }) => ({
    background: `linear-gradient(
    to top,
    ${theme.colors.black} 60%,
    ${theme.colors.halfblack}
  )`,
    height: height,
  })}

  padding: 0 12px;
  flex-wrap: wrap;
  transition: height 0.2s;
`

export const WhiteListItemStyle = styled(SimpleButton)`
  div {
    transition: color ease 0.3s;
  }
  svg {
    transition: fill ease 0.3s;
  }
  ${({ disabled, theme }) =>
    !disabled &&
    `
    cursor: pointer;
    &:hover {
      div {
        color: ${theme.colors.fg};
      }
      svg {
        fill: ${theme.colors.fg};
      }
    }`}
`

export const DomainRow = styled(Flex)`
  ${({ shouldShift }) => ({
    transition: 'transform ease 0.5s',
    transform: `translateX(${shouldShift ? '-100%' : 0})`,
  })}
`

export const WhiteListButton = styled(Button)`
background ease 0.3s,color ease 0.3s;
  ${({ whiteListOpen = false, disabled, theme }) => {
    if (disabled) {
      return {
        color: theme.colors.iconFg,
        borderColor: theme.colors.iconBg,
      }
    } else if (whiteListOpen) {
      return {
        background: theme.colors.bg,
        color: theme.colors.fg,
        '&:hover': {
          color: whiteListOpen ? theme.colors.fg : theme.colors.bg,
        },
      }
    }
  }}
`

export const RefreshButton = styled(Button)`
  ${({ theme }) => ({
    background: theme.colors.orange,
    color: theme.colors.black,
  })}
  height: 1.5rem;
  margin: 0 auto;
  svg {
    fill: white;
  }
`

export const InfoStyle = css`
  padding-left: 9px; /* account for width of svg ℹ️ */
  &:after {
    opacity: 0.5;
    position: relative;
    bottom: 1rem;
    left: 0.5rem;
    content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCA4IDgiPiAgPHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMywzIEw1LDMgTDUsOCBMMyw4IEwzLDMgWiBNMywwIEw1LDAgTDUsMiBMMywyIEwzLDAgWiIvPjwvc3ZnPg==);
  }
`
