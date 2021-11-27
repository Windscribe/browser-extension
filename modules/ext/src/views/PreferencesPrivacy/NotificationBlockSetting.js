import React, { useState, useEffect } from 'react'
import { IS_FIREFOX } from 'utils/constants'
import ToggleSettingItem from './ToggleSettingItem'
import { Box } from '@rebass/emotion'
import { SettingItem } from 'components/Settings'
import { useConnect, useDispatch } from 'ui/hooks'
import { actions } from 'state'

const ACTIVITY = 'preferences_privacy'

const AskForPermissionChrome = ({ setPermDialogOpen, ...props }) => {
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

  return (
    <SettingItem
      onClick={async () => {
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
      }}
      checked={false}
      {...props}
    />
  )
}

export default ({ t, notificationBlockerEnabled, setReloadTrue }) => {
  // we need to know if the dialog is open [ to recheck permissions on open/close]
  const { permDialogOpen } = useConnect(e => e)
  const dispatch = useDispatch()
  const setPermDialogOpen = permOpen =>
    dispatch(actions.permDialogOpen.set(permOpen))
  // state to see if you can even use this feature. False disables the toggle
  const [browserHasNotiPerm, setBrowserHasNotiPerm] = useState(false)

  const toggleNotificationBlocker = v => () =>
    dispatch(
      actions.notificationBlockerEnabled.setandlog({
        value: !v,
        logActivity: ACTIVITY,
      }),
    )
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

  const sharedProps = {
    title: t('Do Not Disturb'),
    subHeading: t('Block all sites from spamming you with notifications'),
    'aria-label': t(
      'Do Not Disturb. Block all sites from spamming you with notifications',
    ),
    linkPath: 'features/dnd',
  }

  return (
    <Box pt={3}>
      {!browserHasNotiPerm && !IS_FIREFOX ? (
        <AskForPermissionChrome
          setPermDialogOpen={setPermDialogOpen}
          {...sharedProps}
        />
      ) : (
        <ToggleSettingItem
          {...sharedProps}
          toggleState={notificationBlockerEnabled}
          disabled={!browserHasNotiPerm}
          toggleEvent={toggleNotificationBlocker(notificationBlockerEnabled)}
          postToggleEvent={setReloadTrue}
        />
      )}
    </Box>
  )
}
