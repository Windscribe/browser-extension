import logic from './logic'

export default {
  lexiconEntries: [
    {
      name: 'favoriteLocations',
      initialState: [],
      stashOnLogout: true,
    },
  ],
  logic,
}
