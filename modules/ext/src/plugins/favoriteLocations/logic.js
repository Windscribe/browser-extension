import pushToDebugLog from 'utils/debugLogger'

export default actions => [
  {
    type: actions.favoriteLocations.toggle,
    latest: true,
    process({ getState, action }, dispatch, done) {
      const {
        name,
        nickname,
        hosts,
        countryCode,
        gps,
        isCenterPro,
        dataCenterId,
        locationId,
        logActivity,
        health,
      } = action.payload

      const { favoriteLocations } = getState()
      const favAlreadyAdded = favoriteLocations.find(
        x => x.dataCenterId === dataCenterId,
      )

      if (favAlreadyAdded) {
        // remove it
        dispatch(
          actions.favoriteLocations.set(
            favoriteLocations.filter(x => x.dataCenterId !== dataCenterId),
          ),
        )
        pushToDebugLog({
          activity: logActivity,
          message: `Removed ${name}-${nickname} from favorite list`,
        })
      } else {
        pushToDebugLog({
          activity: logActivity,
          message: `Added ${name}-${nickname} to favorite list`,
        })
        dispatch(
          actions.favoriteLocations.concat({
            dataCenterId,
            gps,
            name,
            nickname,
            hosts,
            countryCode,
            isCenterPro,
            locationId,
            health,
          }),
        )
      }
      done()
    },
  },
]
