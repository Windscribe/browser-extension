// eslint-disable-next-line no-unused-vars
/* global window */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

const { getState, click } = require('../helpers')

const checkProxyIp = {
  name: 'check proxy IP',
  target: 'chrome',
  it: 'should check if checkip response is the same as what appears in UI',
  run: async popup => {
    const { proxy } = await getState(popup)
    await popup.waitForTimeout(1000)
    const uiIp = await popup.$eval(
      'div[label="ip-address"]',
      el => el.innerHTML,
    )
    return [proxy.publicIp, uiIp.replace('---.---.---.---', '')]
  },
  assert: ([checkIpResponse, uiIp]) => {
    expect(checkIpResponse).to.equal(
      uiIp,
      `expected checkIP() response to match what's in UI`,
    )
  },
}
const connectToProxyLocation = (location, dataCenter) => ({
  name: 'Connect to proxy via the locations menu',
  snapshot: true,
  target: 'chrome',
  it: 'should connect to specified data center',
  run: async popup => {
    const { view: startingView, proxy: proxyBeforeConnect } = await getState(
      popup,
    )

    if (
      startingView.current !== 'Locations' &&
      startingView.current !== 'Main'
    ) {
      await popup.reload()
    }
    await popup.waitForTimeout(3000)
    const { view: curView } = await getState(popup)
    if (curView.current === 'Main') {
      await click(popup, 'button[aria-label="Locations"] > div')
    }

    await click(popup, `div[aria-label="${location}"]`)
    await click(popup, `div[aria-label="${dataCenter}"]`)
    await popup.waitForTimeout(6000) //connection time
    const { proxy: proxyAfterConnect } = await getState(popup)
    return [proxyBeforeConnect, proxyAfterConnect]
  },
  assert: ([proxyBeforeConnect, proxyAfterConnect]) => {
    expect(proxyBeforeConnect).to.not.equal(proxyAfterConnect)
    expect(proxyAfterConnect).to.include({
      status: 'connected',
    })
  },
})

const disconnect = {
  name: 'Disconnect from proxy, via the proxy toggle button',
  snapshot: true,
  target: 'chrome',
  it: 'should disconnect',
  run: async popup => {
    const { proxy: proxyBeforeConnect } = await getState(popup)

    await click(popup, `button[aria-label="proxy-toggle"]`)
    await popup.waitForTimeout(2000)
    const { proxy: proxyAfterConnect } = await getState(popup)
    return [proxyBeforeConnect, proxyAfterConnect]
  },
  assert: ([proxyBeforeConnect, proxyAfterConnect]) => {
    expect(proxyBeforeConnect).to.not.equal(proxyAfterConnect)
    expect(proxyAfterConnect).to.include({
      status: 'disconnected',
    })
  },
}

const connectToProxy = () =>
  process.env.TEST_API_URL.includes('staging')
    ? connectToProxyLocation('United States', 'Los Angeles')
    : connectToProxyLocation('US Central', 'Dallas')

module.exports = [
  checkProxyIp,
  connectToProxy(),
  checkProxyIp,
  disconnect,
  checkProxyIp,
]
