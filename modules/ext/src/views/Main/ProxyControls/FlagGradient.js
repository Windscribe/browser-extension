import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import FlagGradientMask from 'assets/flag-gradient-mask.svg'

export const Gradient = styled.div`
  height: 100%;
  position: absolute;
  top: 0;
  right: 86px;
  width: 100%;
  z-index: 10;
`

export default ({
  Flag = () => null,
  opacity,
  color,
  gradientColor = color || '#006aff',
}) => (
  <>
    <Gradient
      css={css`
        background-image: linear-gradient(
          to bottom,
          ${gradientColor},
          rgba(0, 106, 255, 0.1)
        );
      `}
      style={{
        transition: 'opacity 1s ease',
        opacity,
        left: 0,
      }}
    />
    <div
      css={css`
        z-index: 0;
        position: absolute;
        bottom: 0;
        top: 26px;
        left: 0;
        width: 100%;
        height: 100%;
      `}
    >
      <div
        css={{
          transition: 'opacity 1s ease',
          opacity: Math.ceil(opacity) + 0.5,
        }}
      >
        <FlagGradientMask
          css={css`
            position: absolute;
            z-index: 1;
            height: 100%;
          `}
        />
        <Flag
          css={css`
            opacity: 0.5;
            svg {
            }
          `}
        />
      </div>
    </div>
  </>
)
