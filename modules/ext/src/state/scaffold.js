import { createAction, handleActions } from 'redux-actions'
import { flatMap, camelCase, mapKeys, omit } from 'lodash'
import { produce } from 'immer'

// TODO: unit tests

export const makeActions = ({ domain, verbs, qualifiers }) =>
  flatMap(
    verbs.map(v => [
      `${domain}_${v.toUpperCase()}`,
      ...qualifiers.map(q => `${domain}_${v.toUpperCase()}_${q.toUpperCase()}`),
    ]),
  ).reduce((acc, x) => {
    acc[camelCase(x.split(`${domain}_`).pop())] = createAction(x)
    return acc
  }, {})

const defaultState = () => ({
  error: null,
  loading: false,
})

const fetch = (state, { payload = {} }) => ({
  ...state,
  ...payload,
  loading: true,
})
const fetchSuccess = (state, { payload }) => ({
  loading: false,
  error: false,
  ...payload,
})
const fetchFailure = (state, { payload }) => ({
  ...state,
  loading: false,
  error: payload,
})

// TODO: normalize "data" and "error" keys for consistency

export const makeReducer = ({
  domain,
  // null is a valid starting state
  // noll coalesce operator would be great here
  initialState = domain.initialState === undefined
    ? defaultState()
    : domain.initialState,
  resolvers = domain.resolvers || {},
  actions,
}) =>
  handleActions(
    {
      [actions.fetch]: fetch,
      [actions.fetchSuccess]: fetchSuccess,
      [actions.fetchFailure]: fetchFailure,
      [actions.fetchdelete]: fetch,
      [actions.fetchdeleteSuccess]: fetchSuccess,
      [actions.fetchdeleteFailure]: fetchFailure,
      [actions.set]: (state, { payload }) => payload,
      // same as set but logs set in middle ware, requires value param to set, logActivity param to log
      [actions.setandlog]: (state, { payload }) => payload.value,
      // same as set but ignored by middleware
      [actions.hydrate]: (state, { payload }) => payload,
      [actions.assign]: (state, { payload }) => ({ ...state, ...payload }),
      // TODO: deprecate! use actions.produce instead
      [actions.assigndeep]: (state, { payload }) =>
        produce(state, draft => {
          Object.assign(draft[payload.key], payload.value)
        }),
      [actions.omit]: (state, { payload }) => omit(state, payload),
      [actions.concat]: (state, { payload }) => state.concat(payload),
      [actions.produce]: (state, { payload }) => produce(state, payload),
      [actions.increment]: state => state + 1,
      [actions.decrement]: state => (state !== 0 ? state - 1 : state),
      [actions.default]: () => initialState,
      RESET_ALL: () => initialState,
      ...mapKeys(resolvers, (v, k) => `${domain.name}_${k.toUpperCase()}`),
    },
    initialState,
  )

export default lexicon =>
  lexicon.domains.reduce(
    (acc, d) => {
      const actions = makeActions({
        ...lexicon,
        domain: d.name,
        verbs: [...lexicon.verbs, ...Object.keys(d.resolvers || {})],
      })
      acc.actions[d.name] = actions
      acc.reducers[d.name] = makeReducer({ domain: d, actions })
      return acc
    },
    { actions: {}, reducers: {} },
  )
