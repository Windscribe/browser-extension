import styled from '@emotion/styled'
import { opacity } from 'ui/helpers'
import theme from '../themes/ext.theme'

export const InputContainer = styled.div`
  border-bottom: 2px solid;
  transition: border-color ease 0.3s;
  position: relative;

  ${({ isInvalid = false }) => ({
    borderColor: isInvalid
      ? opacity(theme.colors.red, 0.5)
      : opacity(theme.colors.black, 0.25),
  })};

  ${({ noLabel = false }) =>
    noLabel && {
      input: {
        padding: `${theme.space[2]} 0 0`,
        '::placeholder': {
          color: opacity(theme.colors.black, 0.3),
        },
      },
    }};
`

export const Label = styled.label`
  text-transform: uppercase;
  pointer-events: none;
  transition: transform ease 0.2s;
  position: absolute;
  ${({ isFocused, hasValue }) => ({
    color: theme.colors.halfBlack,
    fontSize: theme.fontSizes[0],
    fontWeight: theme.fontWeights[1],
    transform: `translateY(${isFocused || hasValue ? -15 : 0}px)`,
  })};
`

export const Input = styled.input`
  outline: none;
  border: none;
  width: 100%;

  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px white inset;
    -webkit-text-fill-color: ${({ isInvalid }) =>
      isInvalid ? theme.colors.red : theme.colors.black};
  }

  ${({ isInvalid }) => ({
    color: isInvalid && theme.colors.red,
    fontSize: theme.fontSizes[1],
  })};
`

export const Bar = styled.span`
  display: block;
  position: relative;

  &:before {
    content: '';
    height: 2px;
    left: 0;
    right: 0;
    bottom: -2px;
    position: absolute;
    transition: 0.2s ease all;
    ${({ isFocused, isInvalid }) => ({
      width: isFocused ? '100%' : 0,
      background: theme.colors[isInvalid ? 'red' : 'black'],
    })};
  }
`
