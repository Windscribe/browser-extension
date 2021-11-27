import { store, actions } from 'state'
import { IS_FIREFOX, IS_CHROME } from 'utils/constants'

export default async isEnabled => {
  // before setting, if the user does not have perm, just set the notification toggle to false
  const browserHasPerm = await browser.permissions.contains({
    permissions: [IS_FIREFOX ? 'browserSettings' : 'contentSettings'],
  })

  if (!browserHasPerm) {
    store.dispatch(
      actions.notificationBlockerEnabled.setandlog({
        value: false,
        logActivity: 'no_permission_granted',
        override: true,
      }),
    )
    return
  }

  if (IS_FIREFOX) {
    browser.browserSettings.webNotificationsDisabled.set({
      value: isEnabled,
    })
  } else if (IS_CHROME) {
    if (isEnabled) {
      browser.contentSettings.notifications.set({
        primaryPattern: '<all_urls>',
        setting: 'block',
        scope: 'regular',
      })
    } else {
      browser.contentSettings.notifications.clear({
        scope: 'regular',
      })
    }
  }
}
