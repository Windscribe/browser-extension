import logic from './logic'

export default {
  lexiconEntries: [
    {
      name: 'languageSwitch',
    },
    {
      name: 'languageSwitchEnabled',
      stashOnLogout: true,
      initialState: false,
    },
  ],
  logic,
}
