/* eslint-disable no-undef */
function intlLocale(localeCode) {
  // kind of hacky. Will change when updating script injection function
  if (typeof ODateTimeFormat !== 'undefined') {
    const intl = ODateTimeFormat.prototype.resolvedOptions
    ODateTimeFormat.prototype.resolvedOptions = function() {
      const newIntl = intl.apply(this, arguments)
      newIntl.locale = localeCode
      return newIntl
    }
  } else {
    const intl = Intl.DateTimeFormat.prototype.resolvedOptions
    Intl.DateTimeFormat.prototype.resolvedOptions = function() {
      const newIntl = intl.apply(this, arguments)
      newIntl.locale = localeCode
      return newIntl
    }
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
