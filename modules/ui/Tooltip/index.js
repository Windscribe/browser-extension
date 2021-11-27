import React from 'react'
import Tippy from '@tippy.js/react'
import 'tippy.js/dist/tippy.css'
import { roundArrow } from 'tippy.js'
import { Text } from '@rebass/emotion'
import { ClassNames } from '@emotion/core'

const defaultConfig = {
  arrow: roundArrow,
  inertia: true,
  duration: [300, 0],
  distance: 2,
}

const ToolTip = ({ intl, message, maxWidth, ...props }) => (
  <ClassNames>
    {({ css }) => {
      const tippyBg = `rgba(51, 61, 73, 0.9)`
      const extTippyStyling = css`
        background-color: ${tippyBg};
        color: white;
        padding: 3px 6px;
        border-radius: 4px;
        .tippy-svg-arrow {
          fill: ${tippyBg};
        }
      `
      return (
        <Tippy
          {...defaultConfig}
          content={
            <div style={{ maxWidth }}>
              <Text fontWeight="bold" notranslate="true" fontSize="12px">
                {message}
              </Text>
            </div>
          }
          {...props}
          className={extTippyStyling}
        />
      )
    }}
  </ClassNames>
)

export default ToolTip
