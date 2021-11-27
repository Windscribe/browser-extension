import React from 'react'
import { keyframes } from 'emotion'
import { Box } from '@rebass/emotion'

export const getRotation = elRef => {
  let computedAngle = 0

  const elMatrix =
    elRef.current &&
    window.getComputedStyle(elRef.current).getPropertyValue('transform')

  if (elMatrix && elMatrix !== 'none') {
    const [a, b] = elMatrix.split('(')[1].split(')')[0].split(',')
    computedAngle = Math.round(Math.atan2(b, a) * (180 / Math.PI))
  } else {
    computedAngle = 0
  }
  return computedAngle
}

const SpinAnim = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
`

export const Loader = React.forwardRef(
  (
    {
      size = 20,
      borderSize = 1,
      color = 'blue',
      initialRotation = 0,
      show = true,
      ...props
    },
    ref,
  ) => (
    <Box
      ref={ref}
      css={{
        opacity: `${show ? 1 : 0}`,
        border: `${borderSize}px solid transparent`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRadius: '50%',
        animation: `${SpinAnim} 1s linear infinite`,
        transform: `rotate(${initialRotation}deg)`,
        width: size,
        height: size,
        color: 'transparent',
      }}
      {...props}
    />
  ),
)
