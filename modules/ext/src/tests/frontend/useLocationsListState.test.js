// @ts-nocheck
import useLocationsListState from '../../views/Locations/useLocationsListState'

import { renderHook, act } from '@testing-library/react-hooks'

describe('useLocationsListState hook', () => {
  it('expands/collapses a location', () => {
    const { result } = renderHook(() =>
      useLocationsListState(locations, null, 'geography', {
        locationIndex: 2,
        datacenterIndex: null,
      }),
    )

    act(() => {
      result.current[1]({
        type: 'toggleIsLocationExpanded',
        payload: {
          locationId: 7,
        },
      })
      result.current[1]({
        type: 'cursorDown',
      })
    })

    expect(result.current[0].expandedLocations).toContain(
      result.current[0].locations[2].id,
    )

    act(() => {
      result.current[1]({
        type: 'toggleIsLocationExpanded',
        payload: {
          locationId: 7,
        },
      })
    })

    expect(result.current[0].keyboardCursor).toEqual({
      locationIndex: 2,
      // after collapsing, datacenter index should be reset to null
      datacenterIndex: null,
    })

    expect(result.current[0].expandedLocations).not.toContain(
      result.current[0].locations[2].id,
    )
  })

  describe('search filtering', () => {
    it('includes all datacenters for location when search text matches that location', () => {
      const { result } = renderHook(() => useLocationsListState(locations))

      act(() => {
        result.current[1]({
          type: 'setSearchText',
          payload: {
            searchText: 'Russia',
          },
        })
      })

      const { searchFilteredLocations } = result.current[0]
      expect(searchFilteredLocations).toHaveLength(1)
      expect(searchFilteredLocations[0].name).toBe('Russia')
      expect(searchFilteredLocations[0].isLocationMatched).toBe(true)
      expect(searchFilteredLocations[0].groups).toHaveLength(2)
    })

    it('only includes matched datacenters when search text matches datacenter rather than location', () => {
      const { result } = renderHook(() => useLocationsListState(locations))

      act(() => {
        result.current[1]({
          type: 'setSearchText',
          payload: {
            searchText: 'Toronto',
          },
        })
      })

      const { searchFilteredLocations } = result.current[0]
      expect(searchFilteredLocations).toHaveLength(1)
      expect(searchFilteredLocations[0].name).toBe('Canada')
      expect(searchFilteredLocations[0].isLocationMatched).toBe(false)
      expect(searchFilteredLocations[0].groupMatches).toHaveLength(1)
      expect(searchFilteredLocations[0].groupMatches[0].city).toBe('Toronto')
    })
  })

  it('changes sort order between "geography" and "alphabet"', () => {
    const { result } = renderHook(() =>
      useLocationsListState(locations, null, 'geography'),
    )

    act(() => {
      result.current[1]({
        type: 'setSortBy',
        payload: {
          sortBy: 'alphabet',
        },
      })
    })

    expect(result.current[0].locations.map(location => location.name)).toEqual([
      'Canada',
      'Colombia',
      'Russia',
    ])

    act(() => {
      result.current[1]({
        type: 'setSortBy',
        payload: {
          sortBy: 'geography',
        },
      })
    })

    expect(result.current[0].locations.map(location => location.name)).toEqual([
      'Russia',
      'Colombia',
      'Canada',
    ])
  })

  it('initializes with sorted locations', () => {
    const { result } = renderHook(() => useLocationsListState(locations))
    const state = result.current[0]
    expect(state.locations[1].groups[0].city).toEqual('Bogotá')
  })

  describe('keyboard cursor', () => {
    it("doesn't change on move up when already at top", () => {
      moveCursorAndAssertResult([-1, null], 'up', [-1, null])
    })

    it('moves cursor from autopilot down to first item', () => {
      moveCursorAndAssertResult([-1, null], 'down', [0, null])
    })

    it('moves cursor from first item up to autopilot', () => {
      moveCursorAndAssertResult([0, null], 'up', [-1, null])
    })

    it("doesn't change on move down when already at bottom", () => {
      moveCursorAndAssertResult([2, 1], 'down', [2, 1])
    })

    it('moves cursor down from collapsed location to location', () => {
      moveCursorAndAssertResult([0, null], 'down', [1, null])
    })

    it('moves cursor up from location to collapsed location', () => {
      moveCursorAndAssertResult([1, null], 'up', [0, null])
    })

    it('moves cursor down from datacenter to datacenter', () => {
      moveCursorAndAssertResult([2, 0], 'down', [2, 1])
    })

    it('moves cursor up from datacenter to datacenter', () => {
      moveCursorAndAssertResult([2, 1], 'up', [2, 0])
    })

    it('initializes cursor to currently connected datacenter', () => {
      const { result } = renderHook(() =>
        useLocationsListState(
          locations,
          5, // Medellín, Colombia
          'geography',
        ),
      )

      const { keyboardCursor } = result.current[0]
      expect(keyboardCursor).toEqual({
        locationIndex: 1,
        datacenterIndex: 1, // note: the order changes due to alphabetical sorting at initialization
      })
    })
  })
})

const locations = [
  {
    name: 'Russia',
    id: 1,
    groups: [
      {
        city: 'Moscow',
        nick: 'Mule',
        id: 2,
      },
      {
        city: 'St. Petersburg',
        nick: 'Formerly known as Leningrad',
        id: 3,
      },
    ],
  },
  {
    name: 'Colombia',
    id: 4,
    groups: [
      {
        city: 'Medellín',
        nick: 'Parceros',
        id: 5,
      },
      {
        city: 'Bogotá',
        nick: 'La Capital',
        id: 6,
      },
    ],
  },
  {
    name: 'Canada',
    id: 7,
    groups: [
      {
        city: 'Toronto',
        nick: 'Comfort Zone',
        id: 8,
      },
      {
        city: 'Montreal',
        nick: 'Poutine',
        id: 9,
      },
    ],
  },
]

const moveCursorAndAssertResult = (beforeCursor, direction, afterCursor) => {
  const { result } = renderHook(() =>
    useLocationsListState(locations, null, 'geography', {
      locationIndex: beforeCursor[0],
      datacenterIndex: beforeCursor[1],
    }),
  )

  const actionType = direction === 'up' ? 'cursorUp' : 'cursorDown'
  act(() => {
    result.current[1]({ type: actionType })
  })

  expect(result.current[0].keyboardCursor).toEqual({
    locationIndex: afterCursor[0],
    datacenterIndex: afterCursor[1],
  })
}
