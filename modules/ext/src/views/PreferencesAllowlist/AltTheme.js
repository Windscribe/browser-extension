import React from 'react'
import { ThemeProvider } from 'emotion-theming'
import { useSelector } from 'react-redux'
import { THEME_MAP } from 'utils/constants'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s?.theme,
  (...args) => args,
)

export default ({
  invertCurrentTheme,
  themeName = useSelector(selector)[0],
  children,
}) => {
  const { index } = THEME_MAP.get(themeName)
  const nextThemeIndex = (index + 1) % THEME_MAP.size
  const nextThemeName = [...THEME_MAP.keys()][nextThemeIndex]
  return invertCurrentTheme ? (
    <ThemeProvider theme={THEME_MAP.get(nextThemeName).theme}>
      {children}
    </ThemeProvider>
  ) : (
    <>{children}</>
  )
}
