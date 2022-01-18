import pushToDebugLog from 'utils/debugLogger'
import api from 'api'
import { updateFilterLists, reloadAllFilterLists } from './utils'

export default actions => [
  {
    type: actions.blockListsEnabled.toggle,
    latest: true,
    process: ({ getState, action }, dispatch, done) => {
      const { blockListsEnabled } = getState()
      const { listItem, logActivity } = action.payload
      /* The list name was added to the blockListsEnabled array won't be loaded into µBlock yet. */
      const listEnabled = blockListsEnabled.includes(listItem)
      dispatch(actions.blockLists[listEnabled ? 'add' : 'remove'](listItem))
      pushToDebugLog({
        activity: logActivity,
        message: `Toggled ${listItem} to ${listEnabled}`,
      })
      return done()
    },
  },
  {
    type: actions.blockLists.add,
    latest: true,
    async process({ getState, action }, dispatch, done) {
      if (!action.payload) {
        return done()
      }
      const { list } = getState().blockLists

      const blockList = list.find(x => x.option === action.payload)
      const listUrls = blockList.lists.map(x => x.url)

      if (µBlock.selectedFilterLists.some(x => listUrls.includes(x))) {
        return done()
      }

      await updateFilterLists({
        toSelect: [...µBlock.selectedFilterLists, ...listUrls],
      })
      await reloadAllFilterLists()

      done()
    },
  },
  {
    type: actions.blockLists.remove,
    latest: true,
    async process({ getState, action }, dispatch, done) {
      const { list } = getState().blockLists

      const blockList = list.find(x => x.option === action.payload)
      const listUrls = blockList.lists.map(x => x.url)

      const filteredList = µBlock.selectedFilterLists.filter(
        x => !listUrls.includes(x),
      )

      await updateFilterLists({ toSelect: filteredList })
      await reloadAllFilterLists()
      done()
    },
  },
  {
    type: actions.ublock.fetchblocklists,
    latest: true,
    async process({ getState, action }, dispatch, done) {
      const { logActivity } = action?.payload || {}
      const { blockListsEnabled, advancedModeEnabled } = getState()

      if (advancedModeEnabled) {
        pushToDebugLog({
          activity: logActivity,
          message: `Not Fetching blocklists due to advanced mode`,
        })
        dispatch(actions.lastBlockListCheck.set(Date.now()))
        done()
        return
      }

      try {
        dispatch(actions.blockLists.fetch())
        pushToDebugLog({
          activity: logActivity,
          message: `Fetching blocklists`,
        })
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

        const { toImport, toSelect } = data.blocklists.reduce(
          (obj, item) => {
            const mappedList = item.lists.map(x => x.url)
            if (blockListsEnabled.includes(item.option)) {
              obj.toSelect = obj.toSelect.concat(mappedList)
            }

            obj.toImport = obj.toImport.concat(mappedList)

            return obj
          },
          { toImport: [], toSelect: [] },
        )

        pushToDebugLog({
          activity: logActivity,
          level: 'DEBUG',
          message: `toImport: ${toImport.length} toSelect: ${toSelect.length}`,
        })

        // remove all known lists
        const toRemove = Object.keys(µBlock.availableFilterLists)
        await updateFilterLists({ toRemove, toImport })

        // wait for the removals to happen, then apply new selected lists
        setTimeout(async () => {
          await updateFilterLists({ toSelect })
          await reloadAllFilterLists()

          pushToDebugLog({
            activity: logActivity,
            message: `Succesfully fetched blocklists`,
          })
          pushToDebugLog({
            activity: logActivity,
            level: 'DEBUG',
            message: `Removed ${toRemove.length} blocklists and imported ${toImport.length}`,
          })
        }, 500)
      } catch (error) {
        pushToDebugLog({
          activity: logActivity,
          level: 'ERROR',
          message: `Error while trying to fetch blocklists ${JSON.stringify(
            error,
          )}`,
        })
        dispatch(actions.blockLists.fetchFailure(error))
      }
      dispatch(actions.lastBlockListCheck.set(Date.now()))
      done()
    },
  },
  /* Restore previous ublock lists */
  {
    type: actions.ublock.disableadvancedmode,
    latest: true,
    async process({ getState }, dispatch, done) {
      const { blockListsEnabled, blockLists } = getState()

      const revertedList = blockLists.list.reduce((arr, { option, lists }) => {
        if (blockListsEnabled.includes(option)) {
          return arr.concat(lists.map(x => x.url))
        }

        return arr
      }, [])

      await updateFilterLists({ toSelect: revertedList })
      await reloadAllFilterLists()

      done()
    },
  },
]
