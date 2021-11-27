import { differenceWith, isEqual, isEmpty } from 'lodash'
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
      const { blockLists } = getState()
      const { list: oldBlockList } = blockLists
      dispatch(actions.blockLists.fetch())

      try {
        const { data } = await api.get({
          endpoint: '/ExtBlocklists',
          params: { version: 2 },
        })

        dispatch(actions.blockLists.fetchSuccess({ list: data }))

        const newColumns = data.filter(
          x => !oldBlockList.map(x => x.option).includes(x.option),
        )

        /* We want to import all the new columns urls */
        const { toImport, toSelect } = newColumns.reduce(
          (obj, item) => {
            const mappedList = item.lists.map(x => x.url)
            if (item.default) {
              obj.toSelect = obj.toSelect.concat(mappedList)
            }

            obj.toImport = obj.toImport.concat(mappedList)

            return obj
          },
          { toImport: [], toSelect: [...µBlock.selectedFilterLists] },
        )

        /* Find lists that need to be removed */
        const toRemove = oldBlockList.reduce((arr, x, i) => {
          if (!oldBlockList[i]?.lists) {
            return arr
          }

          const listRemoved = differenceWith(
            oldBlockList[i].lists,
            x.lists,
            isEqual,
          ).map(x => x.url)

          if (!isEmpty(listRemoved)) {
            return arr.concat(listRemoved)
          }

          return arr
        }, [])

        await updateFilterLists({ toRemove, toImport }).then(() =>
          updateFilterLists({ toSelect }),
        )

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
