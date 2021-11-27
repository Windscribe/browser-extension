export const updateFilterLists = ({
  toSelect = [],
  toRemove = [],
  toImport = [],
}) =>
  new Promise((resolve, reject) => {
    try {
      µBlock.applyFilterListSelection({
        what: 'applyFilterListSelection',
        toSelect,
        toRemove,
        toImport: toImport.join('\n'),
      })
      resolve()
    } catch (error) {
      reject(error)
    }
  })

export const reloadAllFilterLists = () =>
  new Promise((resolve, reject) => {
    try {
      µBlock.loadFilterLists()
      resolve()
    } catch (error) {
      reject(error)
    }
  })
