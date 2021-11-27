import * as plugins from 'plugins'
import listen from 'utils/listen'

export default async () => {
  ;['Created', 'Activated', 'Updated', 'Removed'].forEach(verb => {
    const f = (...args) => {
      Object.values(plugins).forEach(plugin => {
        if (plugin[`onTab${verb}`]) plugin[`onTab${verb}`](...args)
      })
    }

    listen(browser.tabs[`on${verb}`], f)
  })
}
