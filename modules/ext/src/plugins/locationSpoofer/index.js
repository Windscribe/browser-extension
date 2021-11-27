import { store } from 'state'

export default {
  lexiconEntries: [
    {
      name: 'locationSpooferEnabled',
      stashOnLogout: true,
      initialState: false,
    },
  ],
  onMessage: {
    'request-spoofed-coords'(_, { resolve }) {
      const {
        currentLocation,
        locationSpooferEnabled,
        proxy,
      } = store.getState()

      if (!currentLocation.coords) {
        return
      }

      return resolve(
        locationSpooferEnabled && proxy.status === 'connected'
          ? JSON.stringify({
              coords: currentLocation.coords,
              timestamp: new Date().getTime(),
            })
          : null,
      )
    },
  },
}
