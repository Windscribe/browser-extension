import { css } from '@emotion/core'
import { opacity } from '../helpers'
import theme from '../themes/ext.theme'

const defaultTransition =
  'background ease 0.3s, color ease 0.3s, transform ease-out 0.1s'

export const baseStyle = css`
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: ${defaultTransition};
`

export const SimpleButtonStyle = () => css`
  ${baseStyle}
`

export const InlineButtonStyle = ({
  active = false,
  solid = false,
  light = false,
  color = theme.colors[light ? 'white' : 'black'],
  disabled = false,
  opacity = 0.3,
  width = 'auto',
} = {}) =>
  css`
    ${baseStyle};

    padding: 0;
    transition: ${defaultTransition}, opacity ease 0.3s;

    ${{
      ...(!solid
        ? theme.button.getOpacity(active)
        : theme.button.getColor(color)),
      ...(disabled && { pointerEvents: 'none', cursor: 'not-allowed' }),
      opacity: solid ? null : active ? 1 : opacity,
      width: width,
    }};

    &:focus {
      outline: 0;
    }
  `

export const IconButtonStyle = ({
  light = false,
  background = light
    ? opacity(theme.colors.white, 0.1)
    : opacity(theme.colors.black, 0.05),
  focusBackground = light
    ? opacity(theme.colors.white, 0.1)
    : opacity(theme.colors.black, 0.08),
}) => css`
  ${baseStyle};
  align-items: center;
  justify-content: center;
  background: ${background};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  position: relative;
  transition: ${defaultTransition}, box-shadow ease 0.3s;

  &:active,
  &:focus {
    ${{
      focusBackground,
      boxShadow: `0 0 0 8px ${
        focusBackground
          ? opacity(focusBackground, 0.2)
          : opacity(theme.colors.black, 0.05)
      }`,
    }};

    outline: 0;
  }
`

export const applySecondaryStyled = light =>
  light
    ? {
        borderColor: opacity(theme.colors.white, 0.3),
        color: theme.colors.white,
        '&:hover': {
          background: theme.colors.white,
          color: theme.colors.black,
        },
      }
    : {
        '&:hover': {
          background: theme.colors.black,
          color: theme.colors.white,
        },
      }

export const applyPrimaryStyled = (light, { colors }) => {
  const base = {
    borderColor: 'transparent',
    color: colors.white,
  }

  return light
    ? {
        ...base,
        background: opacity(colors.white, 0.5),

        '&:hover': {
          color: colors.black,
          background: colors.white,
        },
      }
    : {
        ...base,
        background: opacity(colors.black, 0.5),

        '&:hover': {
          background: colors.black,
        },
      }
}

export const ButtonStyle = ({
  primary = false,
  light = false,
  lg,
  disabled = false,
}) => css`
  ${baseStyle};

  border-radius: 30px;
  border: 2px solid;

  ${disabled && {
    pointerEvents: 'none',
  }};

  ${{
    ...(primary
      ? applyPrimaryStyled(light, theme)
      : applySecondaryStyled(light, theme)),
    ...theme.button.getSize(lg),
  }};

  &:active {
    transform: scale(0.9);
  }

  &:focus {
    outline: 0;
  }
`
