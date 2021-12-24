// uncomment to use the standalone React dev tools with the extension
// import 'react-devtools'

import React from 'react'
import ReactDOM from 'react-dom'
import darkTheme from 'ui/themes/ext.theme.dark'
import { ThemeProvider } from 'emotion-theming'
import { Store } from 'webext-redux'
import { I18nextProvider } from 'react-i18next'
import { IS_FIREFOX } from 'utils/constants'
import i18n from '../i18n'
import Init from './Init'
import ErrorBoundary from './ErrorBoundary'
import { Provider } from 'react-redux'

// TODO: fix this!
// NOTE: this MUST be loaded *after* Router otherwise it will cause a
// duplicate logic error

const store = new Store({
  portName: process.env.REACT_APP_REDUX_PORT || 'WS_BROWSER_EXTENSION_STORE',
})

// If you're creating a new tab with a webpage in the browser, the popup is handled differently.
// Firefox will keep the popup open and push focus to the webpage. With onblur it'll go to main as soon as focus switches
// Chrome will automatically close the popup.
// For firefox we can change the to the unload event so that way the popup window won't suddenly change views.
window[IS_FIREFOX ? 'onunload' : 'onblur'] = () => {
  if (window.devWindow || window.dialogOpen) return

  store.dispatch({ type: 'POPUP_UNMOUNT' })
}

window.store = store

browser.storage.local.get('popupHeight').then(({ popupHeight }) => {
  ReactDOM.render(
    <ThemeProvider theme={darkTheme}>
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <Provider store={store}>
            <Init popupHeight={popupHeight} store={store} />
          </Provider>
        </ErrorBoundary>
      </I18nextProvider>
    </ThemeProvider>,
    document.querySelector('#app-frame'),
  )
})

if (process.env.NODE_ENV === 'development') {
  if (process.env.WEB_EXT_ENABLE_REACT_AXE) {
    const axe = require('react-axe')
    axe(React, ReactDOM, 500)
  }
  // hot switch theme between light and dark
  async function changeTheme(event) {
    const { actions } = await import('state')
    if (event.key === '1') {
      store.dispatch(actions.theme.next())
    }
  }
  window.addEventListener('keypress', changeTheme)
}
