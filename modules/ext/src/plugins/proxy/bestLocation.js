import getBestLocation from 'utils/getBestLocation'

export default actions => ({
  type: actions.bestLocation.fetch,
  latest: true,
  async process({ action, getState }, dispatch, done) {
    const { logActivity } = action?.payload || {}
    const { serverList, session } = getState()

    await getBestLocation({
      serverList,
      dispatch,
      premium: session.is_premium,
      activity: logActivity,
    })

    done()
  },
})
