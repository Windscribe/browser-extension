import { store } from 'state'
import noConnectionIcon from 'assets/proxyIcons/no_connection.png'
import proxyOffIcon from 'assets/proxyIcons/proxy_off.png'
import proxyOnIcon from 'assets/proxyIcons/proxy_on.png'
import proxyOnDouble from 'assets/proxyIcons/proxy_on_double.png'
import proxyFailure from 'assets/proxyIcons/proxy_failure.png'
import desktopOn from 'assets/proxyIcons/desktop_on.png'

export default async () => {
  if (!browser.browserAction.setIcon) {
    console.error('No setIcon browser action')
    return
  }
  const { online, proxy, session } = store.getState()
  let icon = proxyOffIcon
  browser.browserAction.setTitle({ title: 'Disconnected' })

  if (online) {
    const desktopConnected = !!session?.our_ip
    const proxyConnected = proxy.status === 'connected'

    if (desktopConnected && proxyConnected) {
      icon = proxyOnDouble
      await browser.browserAction.setTitle({ title: 'Double Hop' })
    } else if (desktopConnected) {
      icon = desktopOn
      await browser.browserAction.setTitle({ title: 'Connected to Desktop' })
    } else if (proxyConnected) {
      icon = proxyOnIcon
      await browser.browserAction.setTitle({ title: 'Connected to Proxy' })
    } else if (proxy.status === 'error') {
      icon = proxyFailure
      await browser.browserAction.setTitle({ title: 'Proxy Failure' })
    }
  } else {
    icon = noConnectionIcon
    await browser.browserAction.setTitle({ title: 'No Connection' })
  }

  await browser.browserAction.setIcon({ path: icon })
}
