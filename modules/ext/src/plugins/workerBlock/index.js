import logic from './logic'

export default {
  lexiconEntries: [
    {
      name: 'workerBlock',
    },
    {
      name: 'workerBlockEnabled',
      stashOnLogout: true,
      initialState: false,
    },
  ],
  logic,
}
