import { store } from 'state'
import splitHostnameFromURL from 'utils/splitHostnameFromURL'

export default details => {
  const { whitelist } = store.getState()
  const hostname = splitHostnameFromURL(details.url)
  const isWhitelisted = Object.entries(whitelist).some(
    ([, x]) => x.domain === hostname[0],
  )
  if (isWhitelisted) {
    browser.tabs
      .executeScript(details.tabId, {
        runAt: 'document_start',
        matchAboutBlank: true,
        code: `(document.head || document.documentElement).appendChild(Object.assign(document.createElement('script'), {
            textContent: 'const wsWhitelisted = true;'
          })).remove();`,
        allFrames: true,
      })
      .catch(err => err)
  }
}
