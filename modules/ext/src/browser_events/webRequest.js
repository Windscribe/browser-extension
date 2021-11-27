import { FILTER, IS_CHROME } from 'utils/constants'
import listen from 'utils/listen'
import * as plugins from 'plugins'

export default async () => {
  const onWebRequestBeforeRequestListener = (...args) => {
    Object.values(plugins).forEach(plugin => {
      if (plugin.onWebRequestBeforeRequest)
        plugin.onWebRequestBeforeRequest(...args)
    })
  }

  listen(
    browser.webRequest.onBeforeRequest,
    onWebRequestBeforeRequestListener,
    FILTER,
    ['requestBody'],
  )

  const onHeadersReceivedListener = (...args) => {
    Object.values(plugins).forEach(plugin => {
      if (plugin.onWebRequestHeadersReceived)
        plugin.onWebRequestHeadersReceived(...args)
    })
  }

  listen(
    browser.webRequest.onHeadersReceived,
    onHeadersReceivedListener,
    FILTER,
    ['responseHeaders'],
  )

  const onAuthRequiredListener = (...args) => {
    const plugin = Object.values(plugins).find(
      plugin => plugin.onWebRequestAuthRequired,
    )
    return plugin.onWebRequestAuthRequired(...args)
  }

  const onAuthRequiredArgs = [
    onAuthRequiredListener,
    FILTER,
    [IS_CHROME ? 'asyncBlocking' : 'blocking'],
  ]

  listen(browser.webRequest.onAuthRequired, ...onAuthRequiredArgs)

  const onProxyErrorListener = (...args) => {
    Object.values(plugins).forEach(plugin => {
      if (plugin.onProxyError) plugin.onProxyError(...args)
    })
  }

  if (IS_CHROME) {
    listen(browser.proxy.onProxyError, onProxyErrorListener)
  } else {
    listen(browser.proxy.onError, onProxyErrorListener)
  }

  const webRequestOnCompletedListener = (...args) => {
    Object.values(plugins).forEach(plugin => {
      if (plugin.onWebRequestCompleted) plugin.onWebRequestCompleted(...args)
    })
  }
  const webRequestOnCompletedArgs = [webRequestOnCompletedListener, FILTER]

  listen(browser.webRequest.onCompleted, ...webRequestOnCompletedArgs)
}
