import * as plugins from 'plugins'
import listen from 'utils/listen'

export default () => {
  if (browser.contextMenus) {
    const f = (...args) => {
      Object.values(plugins).forEach(plugin => {
        if (plugin.onContextMenuClicked) {
          plugin.onContextMenuClicked(...args)
        }
      })
    }

    listen(browser.contextMenus.onClicked, f)
  }
}
