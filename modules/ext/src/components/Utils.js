import React from 'react'
import { Global, css } from '@emotion/core'
import Tooltip from 'ui/Tooltip'

export const OverrideAppHeight = ({ height }) => (
  <Global
    styles={css`
      #app-frame {
        min-height: ${height} !important;
      }
    `}
  />
)

export const WithToolTip = ({
  tip = '',
  showOnOverflow = false,
  show = false,
  elWidth,
  maxWidth,
  children = {},
  ...props
}) => {
  // should always show tool tip if tip exists
  let shouldShowTip = (tip && tip.length > 0) || show
  if (shouldShowTip && showOnOverflow) {
    // if overflow bool true, then it should only show if over the max
    shouldShowTip = elWidth >= maxWidth
  }

  return shouldShowTip ? (
    <Tooltip message={tip} {...props}>
      {children}
    </Tooltip>
  ) : (
    children
  )
}
