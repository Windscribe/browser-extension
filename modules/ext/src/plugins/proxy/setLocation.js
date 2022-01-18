import pushToDebugLog from 'utils/debugLogger'

export default actions => ({
  type: actions.currentLocation.set,
  process({ getState, action }, dispatch, done) {
    if (action.payload.name === 'cruise_control') {
      pushToDebugLog({
        activity: 'autopilot_engaged',
        message: JSON.stringify(
          getState().cruiseControlList.data?.map(d => ({
            name: d.name,
            hosts: d.hosts,
          })),
          null,
          2,
        ),
      })
    } else {
      pushToDebugLog({
        activity: 'set_location',
        message: JSON.stringify(action.payload, null, 2),
      })
    }

    done()
  },
})
