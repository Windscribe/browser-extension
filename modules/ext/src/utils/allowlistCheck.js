import { store } from 'state'
import splitHostnameFromURL from 'utils/splitHostnameFromURL'

export default details => {
  const { allowlist } = store.getState()
  const hostname = splitHostnameFromURL(details.url)
  const isAllowlisted = Object.entries(allowlist).some(
    ([, x]) => x.domain === hostname[0],
  )
  if (isAllowlisted) {
    browser.tabs
      .executeScript(details.tabId, {
        runAt: 'document_start',
        matchAboutBlank: true,
        code: `(document.head || document.documentElement).appendChild(Object.assign(document.createElement('script'), {
            textContent: 'const wsAllowlisted = true;'
          })).remove();`,
        allFrames: true,
      })
      .catch(err => err)
  }
}
