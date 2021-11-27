import * as plugins from 'plugins'

export default () => {
  ;['Offline', 'Online'].forEach(verb => {
    const f = () => {
      Object.values(plugins).forEach(plugin => {
        if (plugin[`on${verb}`]) plugin[`on${verb}`]()
      })
    }
    window.removeEventListener(verb.toLowerCase(), f)
    window.addEventListener(verb.toLowerCase(), f)
  })
}
