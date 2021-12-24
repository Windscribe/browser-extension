/* eslint-disable no-undef */
function intlLocale(localeCode) {
  Intl.DateTimeFormat = (locales, options = {}) => {
    Object.assign(options, {
      timeZone: Date.prefs[0],
    })
    return ODateTimeFormat([localeCode], options)
  }
}

function navigatorLanguage(localeCode) {
  Object.defineProperty(Object.getPrototypeOf(navigator), 'language', {
    get: function language() {
      return localeCode
    },
  })
}

function navigatorLanguages(localeCode) {
  Object.defineProperty(Object.getPrototypeOf(navigator), 'languages', {
    get: function languages() {
      return [localeCode]
    },
  })
}

const switchLocale = localeCode =>
  injectScript(`
  ${intlLocale.toString()}
  intlLocale('${localeCode.toString()}');
  ${navigatorLanguage.toString()}
  navigatorLanguage('${localeCode.toString()}');
  ${navigatorLanguages.toString()}
  navigatorLanguages('${localeCode.toString()}');
`)

browser.runtime
  .sendMessage({
    type: 'get-state',
    payload: ['languageSwitchEnabled'],
  })
  .then(data => {
    if (data !== undefined && data[0]) {
      browser.storage.local.get('localeCode').then(({ localeCode }) => {
        if (localeCode) switchLocale(localeCode.locale)
      })
    }
  })
