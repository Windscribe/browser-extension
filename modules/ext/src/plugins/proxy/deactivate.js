import checkIp from 'utils/public-ip'
import { IS_CHROME } from 'utils/constants'
import proxyOffIcon from 'assets/proxyIcons/proxy_off.png'
import pushToDebugLog from 'utils/debugLogger'
import setIcon from 'utils/setIcon'
import { shuffle } from 'lodash'

export default actions => ({
  type: actions.proxy.deactivate,
  cancelType: actions.proxy.activate,
  latest: true,
  async process({ getState, action }, dispatch, done) {
    const { logActivity, logout } = action?.payload || {}
    const { notification = true, icon = true } = action.payload || {}
    const { currentLocation } = getState()

    pushToDebugLog({
      activity: logActivity,
      message: 'Deactivating proxy...',
    })

    const onProxyTeardownComplete = async () => {
      //if logout, dont check ip or set location
      if (!logout) {
        let publicIp = null
        try {
          dispatch(
            actions.proxy.assign({
              status: 'disconnecting',
            }),
          )
          publicIp = await checkIp()
          pushToDebugLog({
            activity: logActivity,
            message: 'Successfully applied public IP',
          })
        } catch (err) {
          pushToDebugLog({
            activity: logActivity,
            level: 'ERROR',
            message: `Assigning public IP back encountered a problem: ${err}`,
          })
        } finally {
          dispatch(
            actions.proxy.assign({
              status: 'disconnected',
              publicIp,
            }),
          )
          //shuffle hosts on disconnect to allow for more IP diversity
          currentLocation.hosts = shuffle(currentLocation.hosts)
          dispatch(actions.currentLocation.set(currentLocation))
          // clear the last Auth Error Reset
          dispatch(
            actions.lastAuthErrorReset.set({
              timestamp: '',
              errorCount: 0,
            }),
          )
        }
      }

      dispatch(actions.proxyError.set(false))

      // specific workaround for post crash bug where pac file is not "cleared" yet
      if (IS_CHROME) {
        browser.proxy.settings.get({ incognito: false }, config => {
          const stringyConfig = JSON.stringify(config)
          // check if our pac is still there (this means it was a bad set from before)
          if (stringyConfig?.includes('windscribe')) {
            // since `settings.clear` has not worked, this ensures atleast some functionality
            // these are also default proxy settings in normal browser
            browser.proxy.settings.set({
              value: { mode: 'system' },
              scope: 'regular',
            })
          }
        })
      }

      if (icon) {
        setIcon()
      }
      if (notification) {
        // TODO: i18n
        dispatch(
          actions.systemNotification.set({
            icon: proxyOffIcon,
            message: 'Connection to Windscribe has been terminated',
          }),
        )
      }

      pushToDebugLog({
        activity: logActivity,
        message: 'Proxy has been deactivated',
      })
      done()
    }

    if (IS_CHROME) {
      browser.proxy.settings.clear(
        { scope: 'regular' },
        onProxyTeardownComplete,
      )
    } else {
      browser.runtime.sendMessage({
        hostnames: null,
        direct: true,
        allowlist: [],
      })
      onProxyTeardownComplete()
    }
  },
})
