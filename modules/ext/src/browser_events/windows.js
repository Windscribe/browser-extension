import * as plugins from 'plugins'
import listen from 'utils/listen'

export default () => {
  ;['FocusChanged', 'Created'].forEach(verb => {
    const f = (...args) => {
      Object.values(plugins).forEach(plugin => {
        if (plugin[`onWindow${verb}`]) plugin[`onWindow${verb}`](...args)
      })
    }
    listen(browser.windows[`on${verb}`], f)
  })
}
