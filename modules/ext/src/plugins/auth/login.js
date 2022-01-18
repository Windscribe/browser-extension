import md5 from 'md5'
import api from 'api'
import { omit } from 'lodash'
import { IS_CHROME, SESSION_ERRORS, ACCOUNT_STATES } from 'utils/constants'
import createCruiseControlList from 'utils/createCruiseControlList'
import fetchServerList from 'utils/fetchServerList'
import getEntries from 'plugins/lexicon'
import { updateFilterLists, reloadAllFilterLists } from 'plugins/ublock/utils'
import pushToDebugLog from 'utils/debugLogger'

const ACTIVITY = 'logging_in'
const log = (message, opts = {}) =>
  pushToDebugLog({ activity: ACTIVITY, message, ...opts })
let filterListener, shouldSetExpiredModal

const loadFilterLists = ({ toImport, toSelect }) => {
  return new Promise(async resolve => {
    /* Dumb hack to stop all lists from being loaded right away */
    await updateFilterLists({
      toImport,
      load: false,
    })

    await updateFilterLists({ toSelect })

    filterListener = setInterval(() => {
      if (!µBlock.loadingFilterLists) {
        resolve()
        clearInterval(filterListener)
      }
    }, 100)
  })
}

const initSession = async ({ actions, action, dispatch, getState }) => {
  dispatch(actions.session.fetch())
  dispatch(actions.session.assign({ error: null }))

  try {
    log('Logging in')

    const session = await api.session.login({
      ...action.payload,
      sessionType: api.codes.sessionTypes.ext,
    })

    dispatch(actions.session.fetchSuccess(session))
    if (session.status === ACCOUNT_STATES.EXPIRED) {
      log(`Expired user (${getState().session?.username}) logging in`)
      // particular case where you can still continue with the login 'flow' but be intercepted by expired cta
      dispatch(actions.expiredUsername.set(session.username))

      shouldSetExpiredModal = true
    }

    // if the same user was expired before but has an active status now
    // clear the expiredUsername state
    const { expiredUsername } = getState()

    if (
      session.status === ACCOUNT_STATES.ACTIVE &&
      session.username === expiredUsername
    ) {
      dispatch(actions.expiredUsername.set(null))
    } else if (!session.username || !session.session_auth_hash) {
      log(`Bad data from API: ${JSON.stringify(session)}`)
      return null
    }
    // If this user is free, and there is an expired username in the store
    // if it is not the same user, show an error messagg
    // if it's a pro user just carry on
    else if (
      session.username &&
      !session.is_premium &&
      expiredUsername &&
      expiredUsername !== session.username
    ) {
      log(
        `New free user (${session.username}) logging in while expired user (${expiredUsername}) still exists.`,
      )
      dispatch(
        actions.session.fetchFailure({
          data: {
            // NOTE: hilariously bad. This error will say
            // "you already have a free account that is expired".
            errorCode: 1337,
          },
        }),
      )

      // clear the session we just got so that the poller doesn't fire
      // when the popup is opened again while on the login screen
      dispatch(
        actions.session.assign({
          session_auth_hash: null,
        }),
      )

      return null
    }

    log('Successfully initialized session')

    return session
  } catch (error) {
    const errorData = JSON.parse(error.data)
    dispatch(
      actions.session.fetchFailure({
        data: errorData,
        message: error.message,
      }),
    )
    // check for outstanding states
    if (error.code === SESSION_ERRORS.USER_SUSPENDED) {
      actions.session.fetchFailure({
        data: {
          errorCode: error.code,
        },
      })
      log(`Banned user (${error.bannedUsername}) tried logging in.`)
    } else {
      log(
        `Error while logging in: 
      data: ${JSON.stringify(error)}`,
        {
          level: 'ERROR',
        },
      )
    }

    return null
  }
}

const initServerlist = async ({ actions, dispatch, session }) => {
  dispatch(actions.serverList.fetch())

  try {
    log('Fetching server list')
    const serverList = await fetchServerList(session)
    dispatch(actions.serverList.fetchSuccess(serverList))
    log(
      `Successfully fetched server list. Loc hash: ${serverList?.info?.revision_hash}`,
    )
    return serverList
  } catch (error) {
    dispatch(actions.serverList.fetchFailure(error))
    log(`Error while fetching server list: ${JSON.stringify(error)}`, {
      level: 'ERROR',
    })
    return null
  }
}

const initServerCredentials = async ({ dispatch, actions }) => {
  dispatch(actions.serverCredentials.fetch())
  try {
    const serverCredentials = await api.serverCredentials.get()
    global.serverCredentials = serverCredentials
    dispatch(actions.serverCredentials.fetchSuccess(serverCredentials))
    log('Successfully fetched server credentials')
  } catch (e) {
    const error = omit(e, 'debug')
    dispatch(actions.serverCredentials.fetchFailure(error))
    log(
      `Error while fetching server credentials: ${e.message}, CODE: ${e.code}`,
      {
        level: 'ERROR',
      },
    )
  }
}

const initCruiseControlList = async ({
  dispatch,
  session,
  serverList,
  actions,
}) => {
  dispatch(actions.cruiseControlDomains.fetch())
  dispatch(actions.bestLocation.fetch({ logActivity: ACTIVITY }))

  log('Fetching cruise control domains')
  try {
    const cruiseControlDomainsList = await api.get({
      endpoint: 'CruiseControlDomains',
    })
    dispatch(
      actions.cruiseControlDomains.fetchSuccess(cruiseControlDomainsList),
    )
    //we have a valid list of domains
    if (cruiseControlDomainsList.data.domains) {
      const cruiseControlList = createCruiseControlList({
        serverlist: serverList.data,
        userPremiumStatus: session.is_premium,
        cruiseControlDomains: cruiseControlDomainsList.data.domains,
      })
      dispatch(actions.cruiseControlList.assign({ data: cruiseControlList }))
    }
    log('Successfully initialized cruise control list')
  } catch (error) {
    actions.cruiseControlDomains.fetchFailure(error)
    log(
      `Error while fetching cruise control domains: ${JSON.stringify(error)}`,
      {
        level: 'ERROR',
      },
    )
  }
}

const initBlockLists = async ({ dispatch, actions }) => {
  log('Attempting to fetch blocklists')

  try {
    dispatch(actions.blockLists.fetch())
    /*
        ex of a basic shape of this response
        blocklists: [
          {
            option: "name-of-blocklist",
            lists: [...array of lists that need to be imported],
            default: bool -> whether the list should be loaded by default
          }
        ],
        useragents: "http..."
      */
    const { data } = await api.get({
      endpoint: '/ExtBlocklists',
      params: { version: 3 },
    })
    dispatch(actions.blockLists.fetchSuccess({ list: data.blocklists }))
    dispatch(
      actions.userAgent.getuseragentlist({
        logActivity: 'initBlocklists',
        dataSourceURL: data.useragents,
      }),
    )

    const { toImport, toSelect, listsLoaded } = data.blocklists.reduce(
      (obj, item) => {
        const mappedList = item.lists.map(x => x.url)
        if (item.default) {
          obj.listsLoaded = obj.listsLoaded.concat(item.option)
          obj.toSelect = obj.toSelect.concat(mappedList)
        }

        obj.toImport = obj.toImport.concat(mappedList)

        return obj
      },
      // uBlock update: removed "user-filters"
      { toImport: [], toSelect: [], listsLoaded: [] },
    )
    /* We actually import all lists whether they are loaded by default or not. */
    /* Picking the lists that need to be loaded into ubo */

    /* We use the option key to determine what collection of lists need to be loaded */

    dispatch(actions.blockListsEnabled.set(listsLoaded))
    dispatch(actions.lastBlockListCheck.set(Date.now()))

    log('Loading filter lists')

    await loadFilterLists({ toImport, toSelect })
    await reloadAllFilterLists()

    log('Successfully fetched and parsed blocklists')
  } catch (error) {
    log(
      `Error while fetching and parsing blocklist: ${JSON.stringify(error)}`,
      {
        level: 'ERROR',
      },
    )
    dispatch(actions.blockLists.fetchFailure(error))
  }
}

const initialize = async ({ getState, action, dispatch, session, actions }) => {
  const [serverList] = await Promise.all([
    initServerlist({
      action,
      dispatch,
      session,
      actions,
    }),
    initServerCredentials({
      dispatch,
      actions,
    }),
  ])

  /* Fetch and parse blocklist */
  await Promise.all([
    initBlockLists({ dispatch, actions }),
    serverList
      ? initCruiseControlList({
          dispatch,
          session,
          serverList,
          actions,
        })
      : Promise.resolve(),
  ])

  dispatch(
    actions.newsfeedItems.fetch({ logActivity: ACTIVITY, checkPopup: true }),
  )

  if (!IS_CHROME) {
    log('Set up firefox proxy upon request.')
    dispatch(actions.proxy.setuponrequest())
  }

  dispatch(
    actions.userAgent.assign({
      original: navigator.userAgent,
    }),
  )
  // grab current OS
  await browser.runtime
    .getPlatformInfo()
    .then(info => {
      dispatch(actions.currentOS.set(info.os))
    })
    .catch(() => {
      dispatch(actions.currentOS.set('unknown'))
    })

  if (getState().splitPersonalityEnabled) {
    dispatch(actions.userAgent.activate())
  }

  if (getState().webRTCEnabled) {
    dispatch(actions.webRTC.activate())
  }
}
export default actions => [
  {
    type: [actions.auth.login, actions.auth.autologin],
    latest: true,
    async process({ getState, action }, dispatch, done) {
      // TODO: this function is too long

      dispatch(actions.loggingIn.set(true))

      let session

      if (action.type === `${actions.auth.login}`) {
        const emailValid = email => {
          const emailRegex = /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/
          return emailRegex.test(email)
        }
        if (emailValid(action.payload?.username)) {
          dispatch(
            actions.session.fetchFailure({
              data: {
                // dont allow login via email address
                errorCode: 1997,
              },
            }),
          )
          dispatch(actions.loggingIn.set(false))
          done()
          return
        }
        session = await initSession({
          action,
          dispatch,
          getState,
          actions,
        })
        if (session?.session_auth_hash) {
          api.setConfig({
            sessionAuthHash: session.session_auth_hash,
          })
          dispatch(actions.session.set(session))
        } else {
          //without a valid session, we must end the proc here
          dispatch(actions.loggingIn.set(false))
          done()
          return
        }
      }

      let new_session_token = false

      if (action.type === `${actions.auth.autologin}`) {
        log('Auto login...')
        if (action.payload) {
          api.setConfig({
            sessionAuthHash: action.payload,
          })
          try {
            const response = await api.post({
              endpoint: '/WebSession',
              params: {
                session_type_id: 2,
              },
            })
            pushToDebugLog({
              activity: 'auto_login',
              message: `Converted web session to ext session ${response.data.session_auth_hash}`,
            })
            new_session_token = response.data.session_auth_hash
            api.setConfig({
              sessionAuthHash: new_session_token,
            })
          } catch (err) {
            pushToDebugLog({
              activity: 'auto_login',
              level: 'ERROR',
              message: `Error while converting web to ext session: ${err}`,
            })
          }
        }

        session = await api.session.get()

        if (!session) {
          log('Auto login failed...')
          //without a valid session, we must end the proc here
          dispatch(actions.loggingIn.set(false))
          done()
          return
        } else {
          dispatch(actions.session.set(session))
          if (new_session_token) {
            dispatch(
              actions.session.assign({
                session_auth_hash: new_session_token,
              }),
            )
          }
        }
      }

      await initialize({ getState, action, dispatch, session, actions })
      // hydrate user settings if they exist
      const hash = md5(getState().session.username)
      const stash = getState().userStashes[hash]
      const restoredUserItems = getEntries().reduce((items, d) => {
        if (d.stashOnLogout) {
          if (stash) {
            const actionName = actions[d.name]
            const stashValue = stash[d.name]
            dispatch(actionName.set(stashValue))
            items[d.name] = stashValue
          } else {
            items[d.name] = d.initialState
          }
        }

        return items
      }, {})

      dispatch(actions.originalUserStashState.set(restoredUserItems))
      dispatch(actions.view.set('Main'))

      // if this is a fresh browser session and you are not expired
      if (!stash && !shouldSetExpiredModal) {
        dispatch(
          actions.currentLocation.set({
            name: 'cruise_control',
            nickname: '',
            countryCode: 'AUTO',
            hosts: [],
            isDatacenter: false,
          }),
        )
        dispatch(
          actions.proxy.activate({
            logActivity: `initial_welcome_connect`,
            silent: true,
          }),
        )
        dispatch(actions.view.set('Welcome'))
      } else if (shouldSetExpiredModal) {
        dispatch(actions.view.set('NoData'))
      }

      // this is used to auto reconnect on ext v2 -> v3 upgrade
      if (!getState().firstInstallDate) {
        const oldExtDataString = localStorage.getItem('wsextension_userInfo')
        if (oldExtDataString) {
          try {
            const oldExtData = JSON.parse(oldExtDataString)
            if (oldExtData.current.proxy) {
              const autoPilot = {
                name: 'cruise_control',
                nickname: '',
                countryCode: 'AUTO',
                hosts: [],
                isDatacenter: false,
              }
              dispatch(actions.currentLocation.set(autoPilot))
              dispatch(
                actions.proxy.activate({
                  logActivity: `migrate_restart_proxy`,
                  silent: true,
                }),
              )
            }
          } catch (e) {}
        }
        dispatch(actions.firstInstallDate.set(Date.now()))
      }

      dispatch(actions.loggingIn.set(false))

      shouldSetExpiredModal = false
      done()
    },
  },
  {
    type: actions.ghost.login,
    async process({ getState, action }, dispatch, done) {
      dispatch(actions.loggingIn.set(true))
      //check whether a valid user had logged in previously
      if (Object.keys(getState().userStashes).length > 0) {
        log(`Ghost not allowed: Previous user stash found.`)
        dispatch(actions.view.set('Signup'))
        dispatch(actions.loggingIn.set(false))
        done()
        return
      }

      try {
        log('Fetching token for ghost')
        const response = await api.regToken.getToken()
        //if token present move to create user
        if (response.token) {
          log('Received valid token. Creating ghost user and logging in.')
          const user = await api.users.createGhost({
            token: response.token,
            sessionType: api.codes.sessionTypes.ext,
          })

          if (user?.session_auth_hash) {
            api.setConfig({
              sessionAuthHash: user.session_auth_hash,
            })
          }
          // get and save user session info in store
          // have to call this to get the last reset date which is not supplied by the create user call
          const session = await api.session.get()
          if (!session) {
            log('Ghost login failed...')
            //without a valid session, we must end the proc here
            dispatch(actions.loggingIn.set(false))
            done()
            return
          } else {
            dispatch(actions.session.set({ ...user, ...session }))
          }

          switch (session.status) {
            case ACCOUNT_STATES.EXPIRED:
              log(`Expired ghost user (${session.user_id}) logging in`)
              dispatch(actions.view.set('GhostOutOfData'))
              break
            case ACCOUNT_STATES.ACTIVE:
              log(`Successfully created new ghost user (${session.user_id})`)
              await initialize({ getState, action, dispatch, session, actions })
              dispatch(
                actions.currentLocation.set({
                  name: 'cruise_control',
                  nickname: '',
                  countryCode: 'AUTO',
                  hosts: [],
                  isDatacenter: false,
                }),
              )
              dispatch(
                actions.proxy.activate({
                  logActivity: `initial_welcome_connect`,
                  silent: true,
                }),
              )
              dispatch(actions.view.set('Welcome'))
              break
            default:
              // ACCOUNT_STATES.BANNED:
              log(`Banned ghost user (${session.user_id}) logging in`)
              dispatch(actions.view.set('Signup'))
              break
          }
          if (session?.session_auth_hash) {
            api.setConfig({
              sessionAuthHash: session.session_auth_hash,
            })
            dispatch(actions.session.set(session))
          } else {
            //without a valid session, we must end the proc here
            dispatch(actions.loggingIn.set(false))
            done()
            return
          }
        }
      } catch (e) {
        // change view to error page
        log(`Ghost not allowed: ${e.message}`)
        dispatch(actions.view.set('Signup'))
      }

      dispatch(actions.loggingIn.set(false))
      done()
    },
  },
]
