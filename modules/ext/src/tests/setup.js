import api from 'api'
import sleep from 'shleep'
import checkIp from 'utils/public-ip'
import { constructDebugLog } from 'plugins/debugLog/utils'
import lodash from 'lodash'
import globals from 'utils/globals'
import * as constants from 'utils/constants'
import { getDb } from 'utils/db'
import removeAllCookies from 'plugins/cookieMonster/removeAllCookies'
import { store, actions } from 'state'

export default async () => {
  window.ipAddress = await checkIp()
  // window.ublockNetWhitelist = µBlock.netWhitelist
  window.checkIp = checkIp
  window.constants = constants
  window.sleep = sleep
  window.db = getDb()
  window.constructDebugLog = constructDebugLog
  // used in ws-api-client
  window.CLIENT_AUTH_SECRET = constants.CLIENT_AUTH_SECRET
  window.store = store
  window.actions = actions
  window.globals = globals
  window.ENV = await globals.ENV
  window.TEST_LOCATION = constants.ENVS[window.ENV].TEST_LOCATION
  window.api = api
  window.removeAllCookies = removeAllCookies
  window.windscribeListUrl = 'https://assets.windscribe.com/extension/ws'

  const safety = fn => {
    let i = 0
    const max = 20
    return async (...args) => {
      await fn(...args.concat(i, max))
      i = 0
    }
  }

  window.setView = view => store.dispatch(actions.view.set(view))

  window.turnOffProxy = async () =>
    new Promise(resolve => {
      const unsubscribe = store.subscribe(() => {
        if (store.getState().proxy.status === 'disconnected') {
          unsubscribe()
          resolve()
        }
      })
      store.dispatch(actions.proxy.deactivate())
    })

  window.login = async userInfo =>
    new Promise(resolve => {
      const unsubscribe = store.subscribe(() => {
        if (store.getState().cruiseControlList.data) {
          unsubscribe()
          resolve()
        }
      })

      store.dispatch(actions.auth.login(userInfo))
    })

  window.logout = async opts =>
    new Promise(resolve => {
      const unsubscribe = store.subscribe(() => {
        if (!store.getState()?.session?.username) {
          unsubscribe()
          resolve()
        }
      })

      store.dispatch(actions.auth.logout(opts))
    })

  window.setLocation = safety(
    async (location, i, max) =>
      new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
          i++
          if (i > max) {
            unsubscribe()
            resolve()
          }
          if (
            store.getState().currentLocation.name === location.name &&
            store.getState().proxy.status === 'connected'
          ) {
            unsubscribe()
            resolve()
          }

          if (
            store.getState().currentLocation.name === location.name &&
            store.getState().proxy.status === 'disconnected'
          ) {
            store.dispatch(actions.proxy.activate())
          }
        })

        store.dispatch(actions.currentLocation.set(location))
      }),
  )

  window.setENV = async ENV => {
    window.ENV = ENV

    await browser.storage.local.set({
      ENV,
      API_URL: constants.ENVS[ENV].API_URL,
      ASSETS_URL: constants.ENVS[ENV].ASSETS_URL,
    })

    api.setConfig({
      apiUrl: constants.ENVS[ENV].API_URL,
      assetsUrl: constants.ENVS[ENV].ASSETS_URL,
    })
  }

  window.helpers = {
    createWhitelistShape: ({ domain, config = {} }) => {
      const defaultShape = {
        domain,
        includeAllSubdomains: true,
        allowDirectConnect: false,
        allowAds: false,
        allowCookies: false,
      }

      return { ...defaultShape, ...config }
    },
    waitForStoreValue: ({ action, pathToStateValue }) => {
      return new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
          const res = lodash.get(store.getState(), pathToStateValue)
          if (res) {
            unsubscribe()
            resolve(res)
          }
        })
        store.dispatch(action)
      })
    },
    removeLists: arr =>
      arr.reduce(
        (promise, l) =>
          promise.then(() => {
            store.dispatch(actions.blockListsEnabled.toggle(l))
            Promise.resolve()
          }),
        Promise.resolve(),
      ),
  }
}
