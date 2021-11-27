import baseTheme, { palette } from './ext.theme.js'

// generally, colors that are subject to change
const changingColors = {
  primary: palette.primary,
  fg: palette.black,
  fgLight: palette.black,
  bg: palette.red,
  iconBg: palette.yellow,
  iconFg: palette.black,
  divider: palette.nanowhite,
  headerBgOn: palette.black,
  headerBgOff: palette.black,
  footerBg: palette.black,
  connected: palette.green,
  inactive: palette.quarterwhite,
  iconHover: palette.halfwhite,
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
