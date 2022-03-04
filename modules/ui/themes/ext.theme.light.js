import baseTheme, { palette } from './ext.theme.js'

// generally, colors that are subject to change
const changingColors = {
  primary: palette.primary,
  fg: palette.darkgrey,
  fgLight: palette.halfblack,
  bg: palette.white,
  bgLight: palette.microblack,
  iconBg: palette.microblack,
  iconBgSolid: '#e5e6e8',
  iconFg: palette.black,
  divider: palette.nanoblack,
  headerBgOn: palette.black,
  headerBgOff: palette.black,
  footerBg: palette.black,
  connected: palette.green,
  inactive: palette.quarterblack,
  iconHover: palette.halfblack,
  overlay: palette.offblack,
  scrollBar: 'rgba(0,0,0,0.2)',
}

export default {
  ...baseTheme,
  colors: { ...palette, ...changingColors },
  // buttons: {
  //   primary: {
  //     color: 'white',
  //     bg: 'primary',
  //   },
  // },
}
