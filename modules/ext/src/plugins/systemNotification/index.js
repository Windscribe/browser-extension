import defaultIcon from 'assets/badge.png'
import noConnectionIcon from 'assets/proxyIcons/no_connection.png'

export default {
  lexiconEntries: [
    {
      name: 'systemNotification',
    },
    {
      name: 'allowSystemNotifications',
      initialState: true,
      stashOnLogout: true,
    },
  ],
  logic: actions => [
    {
      type: actions.systemNotification.set,
      latest: true,
      process({ getState, action }, dispatch, done) {
        const { message, icon = defaultIcon } = action.payload
        const { online } = getState()
        if (getState().allowSystemNotifications) {
          if (online) {
            browser.notifications.create({
              type: 'basic',
              iconUrl: icon,
              title: 'Windscribe',
              message,
            })
          } else {
            browser.notifications.create({
              type: 'basic',
              iconUrl: noConnectionIcon,
              title: 'You are not connected to the internet',
              message,
            })
          }
        }
        done()
      },
    },
  ],
}
