import logic from './logic'

export default {
  lexiconEntries: [
    {
      name: 'locationLoad',
    },
    {
      name: 'locationLoadEnabled',
      stashOnLogout: true,
      initialState: true,
    },
  ],
  logic,
}
