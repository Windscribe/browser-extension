import { store, actions } from 'state'
import logic from './logic'
import * as utils from './utils'

export default {
  lexiconEntries: [
    {
      name: 'ublock',
    },
    {
      name: 'ublockEnabled',
      initialState: false,
      stashOnLogout: true,
    },
    {
      name: 'ublockAsked',
      initialState: false,
      stashOnLogout: true,
    },
    {
      name: 'blockLists',
      initialState: {
        loading: false,
        error: null,
        list: [],
      },
    },
    {
      name: 'lastBlockListCheck',
      initialState: null,
    },
    {
      name: 'missingUserFilter',
      initialState: false,
      stashOnLogout: true,
    },
    {
      name: 'blockListsEnabled',
      stashOnLogout: true,
      initialState: [] /* Array of keys */,
      resolvers: {
        toggle: (state, { payload }) =>
          state.includes(payload.listItem)
            ? state.filter(x => x !== payload.listItem)
            : [...state, payload.listItem],
      },
    },
  ],
  initialize() {
    store.dispatch(actions.lastBlockListCheck.set(0))
  },
  logic,
  utils,
}
