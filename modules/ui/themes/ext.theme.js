// note: this is a base theme class, it features static theming config
// it is meant to be extended
import './css/react-toggle'
import './css/tippy'
import { darken } from '../helpers'

const space = [
  '0px',
  '4px',
  '8px',
  '12px',
  '16px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '44px',
  '48px',
  '52px',
  '56px',
]
const fontSizes = [
  '12px',
  '14px',
  '16px',
  '20px',
  '24px',
  '32px',
  '48px',
  '64px',
]

// these need to be used in child themes
export const palette = {
  black: '#020d1c',
  offblack: '#020d1ce6',
  halfblack: 'rgba(2, 13, 28, 0.5)',
  quarterblack: 'rgba(2, 13, 28, 0.25)',
  microblack: 'rgba(2, 13, 28, 0.1)',
  nanoblack: 'rgba(2, 13, 28, 0.05)',
  white: '#ffffff',
  offwhite: '#ffffffe6',
  halfwhite: 'rgba(255, 255, 255, 0.5)',
  quarterwhite: 'rgba(255, 255, 255, 0.25)',
  microwhite: 'rgba(255, 255, 255, 0.1)',
  nanowhite: 'rgba(255, 255, 255, 0.05)',
  darkgrey: '#1a2432',
  halfdarkgrey: 'rgba(255, 255, 255, 0.08)',
  green: '#55ff8a',
  lightGreen: 'rgba(49, 151, 91, 0.7)',

  trueblack: 'rgba(0, 0, 0)',
  truehalfblack: 'rgba(0, 0, 0, 0.5)',
  truemicroblack: 'rgba(0, 0, 0, 0.15)',
  truenanoblack: 'rgba(0, 0, 0, 0.08)',

  lightblue: '#a0feda',
  orange: '#ff8e00',
  primary: '#006aff',
  primarylight: '#006affc0',
  redLight: '#ff3b3bc0',
  red: '#ff3b3b',
  yellow: '#ffe600',
  purple: '#9013FE',
}

// export const accessibleOpacities = {
//   darkBg: {
//     whiteText: opacity(colors.white, 0.5),
//     whiteIcon: opacity(colors.white, 0.25),
//     whiteIconDim: opacity(colors.white, 0.125),
//   },
//   lightBg: {
//     blackText: opacity(colors.black, 0.6),
//     blackBoldText: opacity(colors.black, 0.55),
//     blackDarkerIcon: opacity(colors.black, 0.5),
//     blackIcon: opacity(colors.black, 0.2),
//     blackIconDim: opacity(colors.black, 0.5),
//     blackBorder: opacity(colors.black, 0.05),
//   },
//   colorBg: {
//     whiteText: opacity(colors.white, 0.6),
//   },
//   filters: {
//     loadingFilter: opacity(colors.black, 0.8),
//     newsFeed: opacity(colors.white, 0.15),
//   },
//   buttons: {
//     lightBg: {
//       darkOutline: opacity(colors.black, 0.25),
//     },
//   },
//   borders: {
//     lightBg: {
//       blackBorderDim: opacity(colors.black, 0.1),
//       blackBorder: opacity(colors.black, 0.3),
//     },
//   },
// }

export default {
  space,
  fontSizes,
  fonts: {
    sans: 'plex-sans',
  },
  fontWeights: [400, 700],

  buttons: {
    primary: {
      color: 'white',
      bg: 'primary',
    },
  },

  colors: palette,

  button: {
    getSize: (lg = false) => ({
      fontSize: lg ? fontSizes[1] : fontSizes[0],
      height: lg ? space[10] : space[7],
      padding: lg ? `0 ${space[6]}` : `0 ${space[4]}`,
    }),

    getOpacity: (active = false) => ({
      opacity: active ? 1 : 0.4,
      '&:hover': {
        opacity: 1,
      },
      '&:active': {
        opacity: 1,
      },
    }),

    getColor: color => ({
      color,
      '&:hover': {
        color: darken(color, 0.2),
      },
      '&:active': {
        color: darken(color, 0.4),
      },
    }),
  },
}
