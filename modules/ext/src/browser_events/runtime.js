import { store } from 'state'
import { get } from 'lodash'
import * as plugins from 'plugins'
import listen from 'utils/listen'

const getState = ({ message, resolve }) => {
  if (Array.isArray(message.payload) && message.payload.length > 0) {
    const stateValuesArray = message.payload.map(item =>
      get(store.getState(), item),
    )
    resolve(stateValuesArray)
  } else {
    resolve(get(store.getState(), message.payload))
  }
}

export default () => {
  const f = (message, sender) => {
    return new Promise((resolve, reject) => {
      // We can safely ignore these messages. They are from 'webext-redux'.
      if (message.type.includes('chromex.')) {
        return
      }

      if (message.type === 'get-state') {
        getState({ message, resolve })
      }

      // Send the message
      Object.values(plugins).forEach(plugin => {
        if (plugin.onMessage?.[message.type]) {
          /* We have to pass resolve/reject to the message handler in order for a response to be sent properly */
          plugin.onMessage?.[message.type](message, {
            resolve,
            reject,
            sender,
          })
        }
      })
    })
  }
  listen(browser.runtime.onMessage, f)
}
