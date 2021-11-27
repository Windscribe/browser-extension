import styled from '@emotion/styled'
import { keyframes } from '@emotion/core'

const rotate = keyframes`
  100% {
    transform: rotate(360deg)
  }
`

export const dash = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 200, 200;
    stroke-dashoffset: -124px;
  }
`

export const LoaderContainer = styled.div`
  position: relative;
  margin: ${({ margin }) => margin || '0 auto'};
  width: ${({ size }) => size || 100}px;

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }
`

export const Svg = styled.svg`
  animation: ${rotate} 2s linear infinite forwards;
  height: 100%;
  transform-origin: center center;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  ${({ animationPaused }) =>
    animationPaused && {
      animationPlayState: 'paused',
    }};
`
