import chaiInterface from 'chai-interface'
import chai from 'chai'
import { getState, click } from '../helpers'
chai.use(chaiInterface)
const expect = chai.expect

module.exports = [
  {
    name: 'check smokewall toggle',
    target: 'chrome',
    it: 'should toggle smokewall setting',
    run: async popup => {
      const { view: startingView, smokewall: initial } = await getState(popup)
      if (startingView.current !== 'Main') {
        await popup.reload()
      }

      await click(popup, 'svg[aria-label="Preferences"]')
      await click(popup, 'button[aria-label="Connection"]')
      await click(popup, `div[aria-label="Smokewall toggle"]`)

      const { smokewall: firstChange } = await getState(popup)

      await click(popup, `div[aria-label="Smokewall toggle"]`)

      const { smokewall: secondChange } = await getState(popup)

      return [initial, firstChange, secondChange]
    },
    assert: ([initial, firstChange, secondChange]) => {
      expect(initial).to.be.true
      expect(firstChange).to.be.false
      expect(secondChange).to.be.true
    },
  },
  {
    name: 'check failover dropdown',
    target: 'chrome',
    it: 'should switch failover setting',
    run: async popup => {
      const { failover: initial } = await getState(popup)

      await click(popup, `div[aria-label="failover"]`)
      await click(popup, `div[aria-label="Same Country"]`)

      const { failover: firstChange } = await getState(popup)

      await click(popup, `div[aria-label="None"]`)

      const { failover: secondChange } = await getState(popup)
      return [initial, firstChange, secondChange]
    },
    assert: ([initial, firstChange, secondChange]) => {
      expect(initial).to.equal('Auto / Best')
      expect(firstChange).to.equal('Same Country')
      expect(secondChange).to.equal('None')
    },
  },
  {
    name: 'check proxy port dropdown',
    target: 'chrome',
    it: 'should switch proxy port setting',
    run: async popup => {
      const { proxyPort: initial } = await getState(popup)

      await click(popup, `div[aria-label="proxyPort"]`)
      await click(popup, `div[aria-label="80"]`)

      const { proxyPort: firstChange } = await getState(popup)

      await click(popup, `div[aria-label="443"]`)

      const { proxyPort: secondChange } = await getState(popup)
      return [initial, firstChange, secondChange]
    },
    assert: ([initial, firstChange, secondChange]) => {
      expect(initial).to.equal('443')
      expect(firstChange).to.equal('80')
      expect(secondChange).to.equal('443')
    },
  },
]
