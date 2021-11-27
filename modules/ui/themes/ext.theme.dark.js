import baseTheme, { palette } from './ext.theme.js'

// generally, colors that are subject to change
const changingColors = {
  primary: palette.primary,
  fg: palette.white,
  fgLight: palette.halfwhite,
  bg: palette.darkgrey,
  bgLight: palette.halfdarkgrey,
  iconBg: palette.microwhite,
  iconBgSolid: '#323a47',
  iconFg: palette.white,
  divider: palette.nanowhite,
  headerBgOn: palette.black,
  headerBgOff: palette.black,
  footerBg: palette.black,
  connected: palette.green,
  inactive: palette.quarterwhite,
  iconHover: palette.halfwhite,
  overlay: palette.offwhite,
  scrollBar: 'rgba(255,255,255,0.2)',
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
