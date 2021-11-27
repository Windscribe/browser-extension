import { createStore, applyMiddleware } from 'redux'
import { createLogic, createLogicMiddleware } from 'redux-logic'
import { flatten } from 'lodash'
import * as plugins from 'plugins'
import { REDUCERS_TO_SYNC } from 'utils/constants'
import { syncToLocalStorage } from './middleware'
import { reducer, actions } from './dux'

const logicMiddleware = createLogicMiddleware(
  flatten(
    Object.values(plugins).map(plugin =>
      plugin.logic ? plugin.logic(actions).map(createLogic) : [],
    ),
  ),
)

const middleware = [logicMiddleware, syncToLocalStorage(REDUCERS_TO_SYNC)]

if (
  process.env.WEB_EXT_ENABLE_REDUX_LOGGER &&
  process.env.NODE_ENV === 'development'
) {
  const { createLogger } = require('redux-logger')

  middleware.push(createLogger({ diff: true, collapsed: true }))
}

const store = createStore(reducer, applyMiddleware(...middleware))

export default store
export { logicMiddleware }
