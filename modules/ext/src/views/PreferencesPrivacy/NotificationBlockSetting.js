import React, { useState, useEffect } from 'react'
import { IS_FIREFOX } from 'utils/constants'
import { useConnect, useDispatch } from 'ui/hooks'
import { actions } from 'state'
import ToggleSwitch from '../Preferences/ToggleSwitch'
import { delay } from 'utils/delay'

const ACTIVITY = 'preferences_privacy'

/* It's not possible to request permissions from a popup or a sidebar document.
 * so, this optional firefox permission logic is commented until that is resolved or we implement
 * another way to ask for permission (such w/ browser action or page action, maybe even keyboard shortcut)
 * ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_actions
 */

//if (IS_FIREFOX) {
//clickHandler = () =>
// ff specific 'The request can only be made inside the handler for a user action.'
// if a user input handler waits on a promise, then its status as a user input handler is lost.
// browser.permissions.request({
//   permissions: ['browserSettings'],
// })
// instantiate a listener since ff does not have inBuilt permissions poller
//   browser.runtime.sendMessage({
//     type: 'instantiate-permission-listener-ff',
//   })
// }
//}
//}

export default ({
  notificationBlockerEnabled,
  setReloadAlert,
  setPrivacyOptionsCount,
}) => {
  // we need to know if the dialog is open [ to recheck permissions on open/close]
  const { permDialogOpen } = useConnect(e => e)
  const dispatch = useDispatch()
  const setPermDialogOpen = permOpen =>
    dispatch(actions.permDialogOpen.set(permOpen))
  // state to see if you can even use this feature. False disables the toggle
  const [browserHasNotiPerm, setBrowserHasNotiPerm] = useState(false)

  useEffect(() => {
    const checkPerm = async () => {
      let hasPerm = false
      try {
        hasPerm = await browser.permissions.contains({
          permissions: [IS_FIREFOX ? 'browserSettings' : 'contentSettings'],
        })
      } catch (e) {
        console.error(e)
        hasPerm = false
      }
      setBrowserHasNotiPerm(hasPerm)
    }
    checkPerm()
  }, [permDialogOpen])

  return (
    <ToggleSwitch
      toggleValue={notificationBlockerEnabled}
      onToggle={async () => {
        if (!browserHasNotiPerm && !IS_FIREFOX) {
          setPermDialogOpen(true)
          try {
            await browser.permissions.request({
              permissions: ['contentSettings'],
            })
            setPermDialogOpen(false)
          } catch (e) {
            setPermDialogOpen(false)
            console.error(e)
            console.error(JSON.stringify(e))
          }
        } else {
          setReloadAlert(true)
          setPrivacyOptionsCount(notificationBlockerEnabled)
          dispatch(
            actions.notificationBlockerEnabled.setandlog({
              value: !notificationBlockerEnabled,
              logActivity: ACTIVITY,
            }),
          )
          await delay(250)
        }
      }}
    />
  )
}
