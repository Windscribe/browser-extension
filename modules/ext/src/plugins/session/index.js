import { store, actions } from 'state'
import getSessionAndCheckStatus from './getSessionAndCheckStatus'
import poller from './poller'

export default {
  lexiconEntries: [
    {
      name: 'session',
    },
    {
      name: 'getSessionInFlight',
      initialState: false,
    },
    {
      name: 'sessionPoller',
      initialState: false,
    },
    {
      name: 'lastSessionRequest',
      initialState: null,
    },
    { name: 'serverList' },
    { name: 'serverCredentials' },
    { name: 'cruiseControlDomains' },
    { name: 'cruiseControlList' },
  ],
  initialize() {
    store.dispatch(
      actions.sessionPoller.activate({ logActivity: 'init_session_poller' }),
    )
  },
  logic: actions => [...getSessionAndCheckStatus(actions), poller(actions)],
}
