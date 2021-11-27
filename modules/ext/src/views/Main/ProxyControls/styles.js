import React, { forwardRef } from 'react'
import styled from '@emotion/styled'
import { keyframes } from 'emotion'
import { Flex } from '@rebass/emotion'
import ConnectIcon from 'assets/connect-button.svg'
import { InlineButton, SimpleButton } from 'ui/Button'
import { css } from '@emotion/core'

export const ButtonContainer = styled(SimpleButton)`
  padding: 0;
  z-index: 20;
  transform-origin: 36px 36px;

  ${({ status }) => {
    switch (status) {
      case 'connected':
      case 'connecting':
      case 'disconnecting':
      case 'error':
        return { transform: 'rotate(0)' }
      case 'disconnected':
        return { transform: 'rotate(-180deg)' }
      default:
        return { transform: 'rotate(180deg)' }
    }
  }};
`

export const FaveIcon = styled(InlineButton)`
  svg path {
    fill: ${({ theme }) => theme.colors.white};
  }
  opacity: ${({ active = false }) => (active ? 1 : 0.3)};
`

export const ConnectBar = styled.div`
  position: absolute;
  z-index: 12;
  height: 100%;
`

export const ConnectButton = styled(ConnectIcon)`
  cursor: pointer;
  z-index: 12;
`

export const ConnectorLine = styled(Flex)(({ invert = false, theme }) => {
  return {
    content: '',
    height: '3px',
    width: '100%',
    position: 'relative',
    zIndex: 100,
    backgroundColor: theme.colors.green,
    left: invert ? '-100%' : '100%',
    top: invert ? '25%' : '-25%',
    bottom: 0,
    right: 0,
  }
})

export const Gradient = styled.div`
  height: 100%;
  position: absolute;
  top: 0;
  right: 80px;
  width: 100%;
  z-index: 10;
  background-image: linear-gradient(to left, #006aff, rgba(0, 106, 255, 0.9));
`

export const SpinAnim = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
`
export const Container = forwardRef(
  ({ style, children, flexDirection = 'row' }, ref) => (
    <Flex
      style={style}
      alignItems="center"
      justifyContent="space-between"
      css={css`
        position: absolute;
        height: 100%;
        width: 100%;
        overflow: hidden;
        z-index: 20;
      `}
      ref={ref}
    >
      <Flex
        p={3}
        pb={'13px'}
        alignItems="flex-end"
        css={css`
          width: 100%;
          align-self: flex-end;
        `}
      >
        <Flex
          flexDirection={flexDirection}
          flex={1}
          css={css`
            height: 100%;
            width: 100%;
            align-items: flex-end;
          `}
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  ),
)

export const LocationsIconStyled = styled.div`
  animation-duration: ${({ durationMs }) => durationMs + 'ms'};
  animation-timing-function: steps(36);
  animation-fill-mode: forwards;
  width: 35px;
  height: 24px;
  background-repeat: no-repeat;
  cursor: pointer;
`

export const StyledGlobeIcon = styled.div`
  padding: 10px;
`

export const proxyTimeIconSmallBase64 = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI4cHgiIGhlaWdodD0iOHB4IiB2aWV3Qm94PSIwIDAgOCA4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPiAgICAgICAgPHRpdGxlPkNvbWJpbmVkIFNoYXBlPC90aXRsZT4gICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+ICAgIDxkZWZzPjwvZGVmcz4gICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+ICAgICAgICA8ZyBpZD0iSG9tZS1TY3JlZW4tLS1XaGl0ZWxpc3RlZC0tLU9wZW4tQ29weS0xNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI0My4wMDAwMDAsIC0yNTkuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj4gICAgICAgICAgICA8cGF0aCBkPSJNMjQ3LDI2NyBDMjQ0Ljc5MDg2MSwyNjcgMjQzLDI2NS4yMDkxMzkgMjQzLDI2MyBDMjQzLDI2MC43OTA4NjEgMjQ0Ljc5MDg2MSwyNTkgMjQ3LDI1OSBDMjQ5LjIwOTEzOSwyNTkgMjUxLDI2MC43OTA4NjEgMjUxLDI2MyBDMjUxLDI2NS4yMDkxMzkgMjQ5LjIwOTEzOSwyNjcgMjQ3LDI2NyBaIE0yNDYuNSwyNjAuNSBMMjQ2LjUsMjYzLjUgTDI0OS41LDI2My41IEwyNDkuNSwyNjIuNSBMMjQ3LjUsMjYyLjUgTDI0Ny41LDI2MC41IEwyNDYuNSwyNjAuNSBaIiBpZD0iQ29tYmluZWQtU2hhcGUiPjwvcGF0aD4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg==`
