import chaiInterface from 'chai-interface'
import chai from 'chai'
import { getState, click, find } from '../helpers'
chai.use(chaiInterface)
const expect = chai.expect

module.exports = [
  {
    name: 'check show location load toggle',
    target: 'chrome',
    it: 'should toggle show location load setting',
    run: async popup => {
      const { view: startingView } = await getState(popup)
      if (startingView.current !== 'Main') {
        await popup.reload()
      }

      await click(popup, 'button[aria-label="Locations"]')
      await click(popup, 'div[aria-label="US Central"]')

      const initialBar = await find(popup, 'div[aria-label="healthBar"]')
      await click(popup, `button[aria-label="Back to Main"]`)

      await click(popup, 'svg[aria-label="Preferences"]')
      await click(popup, 'button[aria-label="General"]')

      const { locationLoadEnabled: initialToggle } = await getState(popup)

      await click(popup, `div[aria-label="Show Location Load toggle"]`)

      const { locationLoadEnabled: changeToggle } = await getState(popup)

      await popup.reload()

      await click(popup, 'button[aria-label="Locations"]')
      await click(popup, 'div[aria-label="US Central"]')

      const changeBar = await find(popup, 'div[aria-label="healthBar"]')

      return [initialBar, changeBar, initialToggle, changeToggle]
    },
    assert: ([initialBar, changeBar, initialToggle, changeToggle]) => {
      expect(initialBar).to.be.true
      expect(changeBar).to.be.false
      expect(initialToggle).to.be.true
      expect(changeToggle).to.be.false
    },
  },
]
