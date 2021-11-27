import locales from './locales'

const setLocale = async (currentLocation, proxy) => {
  if (proxy.status === 'connected') {
    const localeCode = locales[currentLocation.countryCode]
    await browser.storage.local.set({
      localeCode,
    })
  }
}

export default actions => [
  {
    type: [
      actions.languageSwitchEnabled.setandlog,
      actions.languageSwitchEnabled.set,
    ],
    latest: true,
    async process({ getState }, dispatch, done) {
      const { currentLocation, proxy } = getState()
      setLocale(currentLocation, proxy)
      done()
    },
  },
  {
    type: actions.proxy.assign,
    latest: true,
    async process({ getState }, dispatch, done) {
      const { languageSwitchEnabled, currentLocation, proxy } = getState()
      if (currentLocation.name === 'cruise_control') {
        await browser.storage.local.set({
          localeCode: null,
        })
      } else if (languageSwitchEnabled) {
        setLocale(currentLocation, proxy)
      }

      done()
    },
  },
  {
    type: [actions.proxy.deactivate, actions.auth.logout],
    latest: true,
    async process({ getState }, dispatch, done) {
      const { languageSwitchEnabled } = getState()
      if (languageSwitchEnabled) {
        await browser.storage.local.set({
          localeCode: null,
        })
      }
      done()
    },
  },
]
