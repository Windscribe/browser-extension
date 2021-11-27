import * as plugins from 'plugins'
import listen from 'utils/listen'
import { IS_CHROME } from 'utils/constants'

export default () => {
  if (IS_CHROME) {
    const onPermissionAddedListener = (...args) => {
      Object.values(plugins).forEach(plugin => {
        if (plugin.onPermissionAdded) plugin.onPermissionAdded(...args)
      })
    }

    listen(browser.permissions.onAdded, onPermissionAddedListener)
  }
}
