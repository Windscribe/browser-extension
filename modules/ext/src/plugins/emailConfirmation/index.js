import api from 'api'
import pushToDebugLog from 'utils/debugLogger'

export default {
  lexiconEntries: [
    {
      name: 'emailConfirmation',
    },
    {
      name: 'emailResendResponse',
      initialState: null,
    },
  ],
  logic: actions => [
    {
      type: actions.emailConfirmation.resend,
      latest: true,
      async process(action, dispatch, done) {
        const { logActivity = 'resend_email' } = action?.payload || {}
        try {
          const response = await api.put({
            endpoint: '/Users',
            params: {
              resend_confirmation: 1,
            },
          })
          dispatch(actions.emailResendResponse.set(response.data))
          pushToDebugLog({
            activity: logActivity,
            message: `Successfully resent confirmation email`,
          })
          done()
        } catch (err) {
          dispatch(actions.emailResendResponse.set(err))
          pushToDebugLog({
            activity: logActivity,
            message: `Failed to resend confirmation email: ${err}`,
          })
          done()
        }
        done()
      },
    },
  ],
}
