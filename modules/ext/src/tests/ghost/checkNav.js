import chai from 'chai'
import chaiInterface from 'chai-interface'
import { getState } from '../helpers'

chai.use(chaiInterface)
const expect = chai.expect

const tests = [
  {
    target: 'chrome',
    it: 'should navigate to signup when get more data is clicked',
    run: async popup => {
      const { view } = await getState(popup)
      if (view !== 'Main') {
        popup.reload()
      }
      await popup.click('div[aria-label="Usage Bar"]')
      await popup.waitFor(2000)
      const state = await getState(popup)

      return state
    },
    assert: ({ view }) => {
      expect(view).to.eq('SignUp')
    },
  },
]

export default tests
