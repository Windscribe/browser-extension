import React from 'react'
import { noop } from 'lodash'
import styled from '@emotion/styled'
import ReactToggle from 'react-toggle'
import { darken, opacity } from 'ui/helpers'
import theme from '../themes/ext.theme'

const ToggleLabel = styled.label`
  display: inline-block;
  margin: 0;
`

const StyledToggle = styled(ReactToggle)(() => ({
  '&': {
    position: 'relative',
  },
  '&:hover:not(.react-toggle--disabled)': {
    cursor: 'pointer',
    '.react-toggle.track': {
      backgroundColor: darken(theme.colors.black, 0.1),
    },
  },

  '.react-toggle-track': {
    backgroundColor: theme.colors.black,
    width: '40px',
    height: '20px',
  },

  '.react-toggle-thumb': {
    width: '18px',
    height: '18px',
  },

  '&.react-toggle--checked': {
    '.react-toggle-track': {
      backgroundColor: theme.colors.primary,
    },

    '.react-toggle-thumb': {
      borderColor: theme.colors.primary,
      left: '21px',
    },

    '&:hover:not(.react-toggle--disabled) .react-toggle-track': {
      backgroundColor: darken(theme.colors.primary, 0.1),
    },
  },

  '&.react-toggle--focus, &:active:not(.react-toggle--disabled)': {
    '.react-toggle-thumb': {
      boxShadow: `0 0 0 10px ${opacity(theme.colors.black, 0.06)}`,
    },
  },
}))

const Toggle = (
  { onChange = noop, onTransitionEnd = noop, icons = false, ...props },
  ref,
) => (
  //synthetic [not in react-toggle api] event on wrapper will 'bubble' up, exposing transition
  <ToggleLabel onTransitionEnd={onTransitionEnd}>
    <StyledToggle icons={icons} onChange={onChange} {...props} />
  </ToggleLabel>
)

export default Toggle
