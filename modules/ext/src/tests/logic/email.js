/* global store */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should send an email verification',
    eval: async () => {
      const { session } = store.getState()

      if (!session.session_auth_hash) {
        await window.login(window.TEST_USER)
      }

      const emailRes = await new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
          const { emailResendResponse } = store.getState()
          if (emailResendResponse) {
            unsubscribe()
            resolve(emailResendResponse)
          }
        })
        store.dispatch(window.actions.emailConfirmation.resend())
      })
      return emailRes
    },
    assert: emailRes => {
      expect(emailRes.email_sent).to.equal(1)
    },
  },
]
