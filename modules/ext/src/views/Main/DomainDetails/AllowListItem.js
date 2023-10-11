import React, { useContext, forwardRef } from 'react'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { WithToolTip } from 'components/Utils'
import { AllowListItemStyle } from './style'
import { DomainBarContext } from '.'

export default forwardRef(
  ({ Icon, title, selected = false, disabled = false, ...props }, ref) => {
    const { colors } = useTheme(ThemeContext)
    const { showingAllowlist } = useContext(DomainBarContext)

    let itemActiveColor = selected ? colors.fg : colors.fgLight
    if (disabled) {
      itemActiveColor = colors.inactive
    }
    return (
      <WithToolTip tip={title} trigger="mouseenter">
        <AllowListItemStyle
          aria-label={title}
          aria-pressed={selected}
          ref={ref}
          tabIndex={showingAllowlist ? 0 : -1}
          px={2}
          py={3}
          alignItems="center"
          justifyContent="center"
          disabled={disabled}
          {...props}
        >
          <Icon fill={itemActiveColor} />
        </AllowListItemStyle>
      </WithToolTip>
    )
  },
)
