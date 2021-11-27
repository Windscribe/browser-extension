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
      await click(popup, 'button[aria-label="Preferences"]')
      await click(popup, 'button[aria-label="General"]')

      await click(
        popup,
        'div.setting-item-container:nth-of-type(3) div.react-toggle-thumb',
      )
      popup.waitFor(2000)
      const { smokewall: firstChange } = await getState(popup)
      await click(
        popup,
        'div.setting-item-container:nth-of-type(3) div.react-toggle-thumb',
      )
      popup.waitFor(2000)
      const { smokewall: secondChange } = await getState(popup)

      await click(popup, 'button[aria-label="Back to Preferences"')
      await click(popup, 'button[aria-label="Back to Main"')

      return [initial, firstChange, secondChange]
    },
    assert: ([initial, firstChange, secondChange]) => {
      expect(initial).to.be.true
      expect(firstChange).to.be.false
      expect(secondChange).to.be.true
    },
  },
]
