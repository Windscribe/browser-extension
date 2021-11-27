import { combineReducers } from 'redux'
import getEntries from 'plugins/lexicon'
import scaffold from './scaffold'
import { verbs, qualifiers } from './verbs'

const { actions, reducers } = scaffold({
  domains: getEntries(),
  verbs,
  qualifiers,
})

const reducer = combineReducers(reducers)

export { actions, reducer }
