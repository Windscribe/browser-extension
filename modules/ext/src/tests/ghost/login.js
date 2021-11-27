import chai from 'chai'
import chaiInterface from 'chai-interface'
import { getState } from '../helpers'

chai.use(chaiInterface)
const expect = chai.expect

const tests = [
  {
    name: 'login',
    snapshot: true,
    target: 'chrome',
    it: 'should be able to login as ghost',
    run: async popup => {
      await popup.click('button[name="ghost"]')

      await popup.waitFor(2000)
      const { session } = await getState(popup)

      return [session]
    },
    assert: ([session]) => {
      expect(session.session_auth_hash).to.be.a('string')
    },
  },
]

export default tests
