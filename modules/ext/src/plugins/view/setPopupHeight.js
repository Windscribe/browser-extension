export default actions => ({
  type: [
    actions.session.set,
    actions.session.fetchSuccess,
    actions.auth.logout,
  ],
  async process({ getState, action }, dispatch, done) {
    const { session } = getState()
    let height = 0

    if (
      !session.session_auth_hash ||
      action.type === actions.auth.logout.toString()
    ) {
      height = 300
    } else if (session.is_premium) {
      height = 210
    } else if (!session.is_premium) {
      height = 237
    }

    await browser.storage.local.set({ popupHeight: height + 'px' })
    dispatch(actions.popupHeight.set(height + 'px'))
    done()
  },
})
