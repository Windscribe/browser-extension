import React from 'react'
import { configure, storiesOf, addDecorator } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { ThemeProvider } from 'emotion-theming'
import theme from 'ui/themes/ext.theme'

let req = require.context('../', true, /\.story\.js$/)

function loadStories() {
  req.keys().forEach(file => req(file))
}

addDecorator(story => <ThemeProvider theme={theme}>{story()}</ThemeProvider>)

addDecorator(withKnobs)

configure(loadStories, module)
