import { useMemo, useReducer } from 'react'
import Fuse from 'fuse.js'
import { sortBy } from 'lodash'

/**
 * Hook that manages all state for the locations list.
 * @param {*} locations - list of locations from Windscribe API
 * @param {*} currentConnectedDatacenterId - ID of the datacenter we're currently connected to.
 * If set, the state will initialize with the keyboard cursor on this datacenter.
 * @param {*} initialKeyboardCursorOverride - set the keyboard cursor manually (just for testing)
 */
export default function useLocationsListState(
  locations,
  currentConnectedDatacenterId = null,
  initialSortBy = 'geography',

  // only exposed for testing
  initialKeyboardCursorOverride = null,
) {
  const locationsWithSortedDatacenters = locations.map(location => {
    const sortedDatacenters = sortBy(location.groups, ['city'])
    return {
      ...location,
      groups: sortedDatacenters,
    }
  })

  const locationOfCurrentConnectedDatacenter = useMemo(() => {
    return locationsWithSortedDatacenters.find(
      location =>
        location.groups?.findIndex(
          datacenter => datacenter.id === currentConnectedDatacenterId,
        ) !== -1,
    )?.id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only computed once since only needed on first load

  // initialize keyboard cursor to either the initially connected datacenter if specified,
  // or the top if not
  const initialKeyboardCursor = useMemo(() => {
    if (initialKeyboardCursorOverride) {
      return initialKeyboardCursorOverride
    }

    if (currentConnectedDatacenterId !== null) {
      const locationIndex = locationsWithSortedDatacenters.findIndex(
        location =>
          location.groups?.findIndex(
            datacenter => datacenter.id === currentConnectedDatacenterId,
          ) !== -1,
      )

      const datacenterIndex = locationsWithSortedDatacenters[
        locationIndex
      ].groups?.findIndex(
        datacenter => datacenter.id === currentConnectedDatacenterId,
      )

      return { locationIndex, datacenterIndex }
    } else {
      return {
        locationIndex: -1, // autopilot
        datacenterIndex: null,
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only computed once since only needed on first load

  const reducer = (state, action) => {
    switch (action.type) {
      case 'cursorUp':
        return moveCursor(state, 'up')
      case 'cursorDown':
        return moveCursor(state, 'down')
      case 'toggleIsLocationExpanded':
        return toggleIsLocationExpanded(state, action.payload.locationId)
      case 'setSearchText':
        return setSearchText(state, action.payload.searchText)
      case 'toggleIsCursorExpanded':
        return toggleIsCursorExpanded(state)
      case 'setKeyboardCursorToLocation':
        return setKeyboardCursorToLocation(state, action.payload.locationId)
      case 'setSortBy':
        return setSortBy(
          state,
          locationsWithSortedDatacenters,
          action.payload.sortBy,
        )
      default:
        break
    }

    return state
  }

  return useReducer(reducer, null, () => {
    return setSortBy(
      {
        locations: locationsWithSortedDatacenters,
        keyboardCursor: initialKeyboardCursor,
        searchFilteredLocations: locationsWithSortedDatacenters,
        expandedLocations: new Set([locationOfCurrentConnectedDatacenter]),

        // This is just an implementation detail and not something that consumers of the hook
        // should actually use. We store this in the state so that we can search inside the
        // reducer on `setSearchText`, while only creating a new `Fuse` object when the search
        // text changes.
        __fuse: createLocationsListFuse(locationsWithSortedDatacenters),
      },
      locationsWithSortedDatacenters,
      initialSortBy,
    )
  })
}

// #region Helper functions for reducer

function setKeyboardCursorToLocation(state, locationId) {
  const locationIndex = state.locations.findIndex(
    location => location.id === locationId,
  )

  if (locationIndex === -1) {
    return state
  }

  return {
    ...state,
    keyboardCursor: {
      locationIndex,
      datacenterIndex: null,
    },
  }
}

function toggleIsCursorExpanded(state) {
  const { keyboardCursor, locations, expandedLocations } = state

  // make sure we're actually on a location before expanding
  if (
    keyboardCursor.locationIndex !== -1 &&
    keyboardCursor.datacenterIndex === null
  ) {
    const cursorLocation = locations[keyboardCursor.locationIndex]
    const newExpandedLocations = new Set(expandedLocations)
    if (newExpandedLocations.has(cursorLocation.id)) {
      newExpandedLocations.delete(cursorLocation.id)
    } else {
      newExpandedLocations.add(cursorLocation.id)
    }

    return {
      ...state,
      expandedLocations: newExpandedLocations,
    }
  }

  return state
}

function moveCursor(state, direction) {
  if (!['up', 'down'].includes(direction)) {
    throw new Error('direction must be either "up" or "down"')
  }

  const { keyboardCursor, locations, expandedLocations } = state
  const { locationIndex, datacenterIndex } = keyboardCursor
  const location = locations[locationIndex]

  let newLocationIndex = locationIndex
  let newDatacenterIndex = datacenterIndex

  if (datacenterIndex === null) {
    // null datacenter index means the cursor is on a location, rather than a datacenter

    if (direction === 'down') {
      if (locationIndex === -1) {
        newLocationIndex = 0
        newDatacenterIndex = null
      }
      // cursor is on the location itself, not a specific datacenter within it
      else if (expandedLocations.has(location.id)) {
        // start on the first datacenter for this location
        newDatacenterIndex = 0
      } else {
        if (locationIndex < locations.length - 1) {
          newLocationIndex++
          newDatacenterIndex = null
        }
      }
    } else {
      if (locationIndex === 0) {
        // back to the autopilot item
        newLocationIndex = -1
        newDatacenterIndex = null
      } else if (locationIndex > 0) {
        const prevLocation = locations[locationIndex - 1]
        newLocationIndex--
        if (expandedLocations.has(prevLocation.id)) {
          // move to last datacenter of previous location
          newDatacenterIndex = prevLocation.groups.length - 1
        }
      }
    }
  } else {
    // the cursor is on a datacenter, rather than a location

    if (direction === 'down') {
      // cursor is on a data center index
      if (datacenterIndex < location.groups.length - 1) {
        // next datacenter in this location
        newDatacenterIndex++
      } else {
        // current is last datacenter in list - move to next location if possible
        if (locationIndex < locations.length - 1) {
          newLocationIndex++
          newDatacenterIndex = null
        }
      }
    } else {
      if (datacenterIndex > 0) {
        newDatacenterIndex--
      } else {
        newDatacenterIndex = null
      }
    }
  }

  return {
    ...state,
    keyboardCursor: {
      locationIndex: newLocationIndex,
      datacenterIndex: newDatacenterIndex,
    },
  }
}

function toggleIsLocationExpanded(state, locationId) {
  const locationIndex = state.locations.findIndex(
    location => location.id === locationId,
  )

  if (locationIndex === -1) {
    // autopilot location - doesn't expand or collapse
    return state
  }

  const location = state.locations[locationIndex]

  // if keyboard cursor is inside the location we're collapsing, set it to the root of the
  // cursor location
  const keyboardCursor = (() => {
    if (
      state.keyboardCursor.locationIndex === locationIndex &&
      state.expandedLocations.has(locationId)
    ) {
      return {
        ...state.keyboardCursor,
        datacenterIndex: null,
      }
    } else {
      return state.keyboardCursor
    }
  })()

  const newExpandedLocations = new Set(state.expandedLocations)
  if (!newExpandedLocations.has(location.id)) {
    newExpandedLocations.add(location.id)
  } else {
    newExpandedLocations.delete(location.id)
  }

  return {
    ...state,
    keyboardCursor,
    expandedLocations: newExpandedLocations,
  }
}

function filterMatchedLocationsList(matchedList) {
  return matchedList.map(({ item, matches }) => {
    let isLocationMatched = false
    const groupMatches = []

    matches.forEach(match => {
      if (match.key === 'name') {
        isLocationMatched = true
      } else if (match.key === 'groups.city' || match.key === 'groups.nick') {
        const datacenter = item.groups[match.arrayIndex]
        groupMatches.push(datacenter)
      }
    })

    return { ...item, isLocationMatched, groupMatches }
  })
}

function setSearchText(state, searchText) {
  if (searchText && searchText.length > 0) {
    const searchFilteredLocations = filterMatchedLocationsList(
      state.__fuse.search(searchText),
    )
    return {
      ...state,
      searchText,
      searchFilteredLocations,
    }
  } else {
    return {
      ...state,
      searchText,
      searchFilteredLocations: state.locations,
    }
  }
}

function setSortBy(state, originalList, sortBy) {
  const compareLocations = (locationA, locationB) => {
    return locationA.name.localeCompare(locationB.name)
  }

  const { keyboardCursor, locations } = state
  const { locationIndex, datacenterIndex } = keyboardCursor

  const cursorLocation = locationIndex === -1 ? null : locations[locationIndex]
  const cursorDatacenterId =
    datacenterIndex === null ? null : cursorLocation.groups[datacenterIndex].id

  if (sortBy === 'alphabet') {
    const sortedLocationsList = [...originalList]
    const sortedSearchFilteredLocations = [...state.searchFilteredLocations]
    sortedLocationsList.sort(compareLocations)
    sortedSearchFilteredLocations.sort(compareLocations)

    const newKeyboardCursor =
      cursorLocation === null
        ? { locationIndex: -1, datacenterIndex: null }
        : keyboardCursorForDatacenter(
            sortedLocationsList,
            cursorLocation.id,
            cursorDatacenterId,
          )

    return {
      ...state,
      locations: sortedLocationsList,
      searchFilteredLocations: sortedSearchFilteredLocations,
      __fuse: createLocationsListFuse(sortedLocationsList),
      keyboardCursor: newKeyboardCursor,
    }
  } else if (sortBy === 'geography') {
    const sortedSearchFilteredLocations = setSearchText(
      { ...state, locations: originalList },
      state.searchText,
    ).searchFilteredLocations.slice()

    const newKeyboardCursor = keyboardCursorForDatacenter(
      originalList,
      cursorLocation?.id,
      cursorDatacenterId,
    )

    return {
      ...state,
      locations: originalList,
      searchFilteredLocations: sortedSearchFilteredLocations,
      __fuse: createLocationsListFuse(originalList),
      keyboardCursor: newKeyboardCursor,
    }
  }

  return state
}

function createLocationsListFuse(locations) {
  return new Fuse(locations, {
    shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name', 'groups.city', 'groups.nick'],
    includeMatches: true,
  })
}

function keyboardCursorForDatacenter(locations, locationId, datacenterId) {
  const locationIndex = locations.findIndex(
    location => location.id === locationId,
  )

  if (locationIndex === -1) {
    return {
      locationIndex: -1,
      datacenterIndex: null,
    }
  }
  const datacenterIndex = locations[locationIndex].groups?.findIndex(
    datacenter => datacenter.id === datacenterId,
  )

  return {
    locationIndex,
    datacenterIndex: datacenterIndex === -1 ? null : datacenterIndex,
  }
}
// #endregion
