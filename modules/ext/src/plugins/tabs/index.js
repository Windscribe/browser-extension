import { store, actions } from 'state'
import format from './format'

export default {
  lexiconEntries: [
    {
      name: 'tabs',
      initialState: {},
      resolvers: {
        UBLOCK_ONBEFOREREQUEST_NETFILER_REVERSE_LOOKUP_RESULT: (
          state,
          { payload },
        ) => {
          const next =
            state[payload.tabId]?.trackersBlocked == null /* 😭 */
              ? 0
              : state[payload.tabId]?.trackersBlocked + 1

          return {
            ...state,
            [payload.tabId]: {
              ...state[payload.tabId],
              trackersBlocked: next,
            },
          }
        },
      },
    },
    {
      name: 'activeTabId',
      initialState: null,
    },
    {
      name: 'lastHostnameWasInvalid',
      initialState: false,
    },
  ],
  async initialize() {
    const { dispatch } = store
    // get all existing tabs
    const tabs = await browser.tabs.query({ windowType: 'normal' })

    if (!tabs?.length) return

    dispatch(
      actions.tabs.assign(
        tabs.reduce((acc, { id, ...props }) => {
          const { hostnameInvalid } = format({ id, ...props })
          if (!hostnameInvalid) {
            acc[id] = {
              ...props,
              adsBlocked: 0,
              trackersBlocked: 0,
            }
          }
          return acc
        }, {}),
      ),
    )

    dispatch(actions.activeTabId.set(tabs.find(x => x.active).id))
  },
  onTabCreated({ id, ...props }) {
    const { dispatch } = store
    const { hostnameInvalid } = format({ id, ...props })

    // opening a new invalid tab
    if (hostnameInvalid) {
      dispatch(actions.lastHostnameWasInvalid.set(true))
    } else {
      // opening a website
      // rewrite only makes sense on valid domain
      dispatch(
        actions.tabs.assign({
          [id]: { ...props, adsBlocked: 0, trackersBlocked: 0 },
        }),
      )

      dispatch(
        actions.tabs.produce(tabState => {
          tabState[id].shouldReloadPage = false
        }),
      )

      dispatch(actions.lastHostnameWasInvalid.set(false))
    }
  },
  async onTabActivated({ tabId }) {
    const { dispatch } = store
    const updatedTab = await browser.tabs.get(tabId)
    const { hostnameInvalid } = format(updatedTab)

    if (hostnameInvalid) {
      dispatch(actions.lastHostnameWasInvalid.set(true))
    } else {
      dispatch(actions.activeTabId.set(tabId))
      dispatch(actions.lastHostnameWasInvalid.set(false))
    }
  },
  async onTabUpdated(tabId, changeInfo) {
    const { dispatch } = store
    const state = store.getState()
    const tab = state.tabs[tabId]

    const updatedTab = await browser.tabs.get(tabId)
    const { hostnameInvalid } = format(updatedTab)

    if (hostnameInvalid) {
      dispatch(actions.lastHostnameWasInvalid.set(true))
    } else {
      // TODO: store previous domain information
      dispatch(actions.tabs.assign({ [tabId]: { ...tab, ...updatedTab } }))

      if (state.lastHostnameWasInvalid) {
        dispatch(actions.activeTabId.set(tabId))
        dispatch(actions.lastHostnameWasInvalid.set(false))
      }

      if (changeInfo?.status !== 'loading') {
        dispatch(
          actions.tabs.produce(tabState => {
            tabState[tabId].shouldReloadPage = false
          }),
        )
      }
    }
  },
  onTabRemoved(id) {
    store.dispatch(actions.tabs.omit(id))
  },
  async onWindowFocusChanged(windowId) {
    if (windowId === -1) return // Assume it's devtools?

    const [activeTab] = await browser.tabs.query({ windowId, active: true })

    const { hostnameInvalid } = format(activeTab)

    if (hostnameInvalid) {
      store.dispatch(actions.lastHostnameWasInvalid.set(true))
    } else {
      store.dispatch(actions.activeTabId.set(activeTab.id))
      store.dispatch(actions.lastHostnameWasInvalid.set(false))
    }
  },
}
