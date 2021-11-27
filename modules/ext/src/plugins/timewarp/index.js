import logic from './logic'

export default {
  lexiconEntries: [
    {
      name: 'proxyTime',
    },
    {
      name: 'proxyTimeEnabled',
      stashOnLogout: true,
      initialState: false,
    },
  ],
  logic,
}
