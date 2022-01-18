// @ts-nocheck
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { createRef, useEffect, useMemo, useRef } from 'react'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import LocationListItem from './LocationListItem'
import AutopilotListItem from './AutopilotListItem'
import { Flex } from '@rebass/emotion'

/**
 * List of locations and datacenters. Locations can contain multiple datacenters, and
 * can expand and collapse. Also included is keyboard navigation functionality, using
 * the arrow keys to move up/down, space to expand/collapse a location and enter to
 * connect to a datacenter.
 */
export default function LocationsList({
  currentDatacenterId = null,
  onAutopilotSelected,
  onDatacenterSelected,
  onHeartIconClick,
  state,
  dispatch,
  favouritesList,

  // some locations can only be connected to with a pro account
  isUserPro = false,

  setScrollTop = null,
  isConnected,
}) {
  const {
    keyboardCursor,
    locations,
    searchFilteredLocations,
    expandedLocations,
    searchText,
    favourites,
  } = state

  const locationsListRef = useRef(null)

  const theme = useTheme(ThemeContext)
  const initialLocations = useRef(locations)
  const isSearching = searchText && searchText.length > 0

  // the type of list item the cursor is on (autopilot, location or datacenter),
  // along with the ID of that item
  const cursorItemInfo = (() => {
    if (keyboardCursor.locationIndex === -1) {
      return {
        type: 'autopilot',
        id: -1,
      }
    } else if (keyboardCursor.datacenterIndex === null) {
      return {
        type: 'location',
        id: locations[keyboardCursor.locationIndex].id,
      }
    } else {
      return {
        type: 'datacenter',
        id:
          locations[keyboardCursor.locationIndex].groups[
            keyboardCursor.datacenterIndex
          ].id,
      }
    }
  })()

  // we store a mapping of the IDs of all datacenters and locations to the refs
  // corresponding to their list item elements, for programmatic scrolling
  const idsToRefsByListItemType = useMemo(() => {
    const idsToRefsByType = {
      autopilot: {
        [-1]: createRef(),
      },
      location: {},
      datacenter: {},
    }

    initialLocations.current.forEach(({ groups, id }) => {
      idsToRefsByType.location[id] = createRef()
      groups.forEach(({ id }) => {
        idsToRefsByType.datacenter[id] = createRef()
      })
    })
    return idsToRefsByType
  }, [])

  // if currently connected, scroll to the connected datacenter on initial load
  useEffect(() => {
    if (!currentDatacenterId) {
      return
    }

    const scrollLocationRef =
      idsToRefsByListItemType.datacenter[currentDatacenterId]
    if (setScrollTop && isConnected) {
      const newScrollTop = scrollLocationRef.current?.getBoundingClientRect()
        .top
      setScrollTop(newScrollTop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // we only want to run this once

  // bind key down listeners
  useEffect(() => {
    if (isSearching) {
      return
    }

    const keyDownListener = event => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          dispatch({
            type: event.key === 'ArrowDown' ? 'cursorDown' : 'cursorUp',
          })
          try {
            const cursorLocationRef =
              idsToRefsByListItemType[cursorItemInfo.type][cursorItemInfo.id]
            const locationScrollY = cursorLocationRef?.current?.offsetTop
            if (setScrollTop) {
              // this is the current location of the cursor, so we offset by +/- 1 row depending
              // on the navigation direction
              setScrollTop(
                locationScrollY + (event.key === 'ArrowUp' ? -48 : 48),
              )
            }
          } catch (ex) {
            console.error('exception caught trying to set scroll top', ex)
          }
          break
        }
        case ' ':
          dispatch({
            type: 'toggleIsCursorExpanded',
          })
          break
        case 'Enter':
          if (keyboardCursor.locationIndex === -1) {
            onAutopilotSelected()
          } else if (keyboardCursor.datacenterIndex !== null) {
            const cursorDatacenter =
              locations[keyboardCursor.locationIndex].groups[
                keyboardCursor.datacenterIndex
              ]
            onDatacenterSelected(cursorDatacenter.id)
          }
          break
        default:
          // allow event to bubble up if it's not a key we care about
          return
      }

      event.preventDefault()
    }
    document.addEventListener('keydown', keyDownListener)
    return () => document.removeEventListener('keydown', keyDownListener)
  }, [
    keyboardCursor,
    locations,
    isSearching,
    dispatch,
    idsToRefsByListItemType,
    cursorItemInfo.type,
    cursorItemInfo.id,
    setScrollTop,
    onAutopilotSelected,
    onDatacenterSelected,
  ])

  const locationsToShow = isSearching ? searchFilteredLocations : locations
  return (
    <div
      ref={locationsListRef}
      css={css`
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        margin-top: 2px;
      `}
    >
      {locationsToShow.length === 0 && (
        <Flex
          css={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.fgLight,
            fontSize: theme.fontSizes[2],
          }}
        >
          No Results :(
        </Flex>
      )}
      <div
        css={{
          paddingLeft: theme.space[4],
        }}
      >
        {!isSearching && (
          <AutopilotListItem
            elementRef={idsToRefsByListItemType.autopilot[-1]}
            onClick={onAutopilotSelected}
            hasCursor={keyboardCursor.locationIndex === -1}
          />
        )}
        {locationsToShow.map(
          (
            {
              id,
              country_code,
              name,
              groups,
              groupMatches,
              isLocationMatched,
              premium_only,
            },
            index,
          ) => {
            // to avoid triggering re-renders on all locations when the cursor changes
            // (`DatacenterListItem` is memoized), we only pass the ID of the location of
            // the cursor if it is the ID of either this location or one of its datacenters
            const maybeCursorListItemInfo = (() => {
              if (
                cursorItemInfo.type === 'location' &&
                cursorItemInfo.id === id
              ) {
                return cursorItemInfo
              } else {
                if (
                  groups?.findIndex(datacenter => {
                    return (
                      cursorItemInfo.type === 'datacenter' &&
                      cursorItemInfo.id === datacenter.id
                    )
                  }) !== -1
                ) {
                  return cursorItemInfo
                }
              }

              return null
            })()

            return (
              <LocationListItem
                id={id}
                idsToRefsByListItemType={idsToRefsByListItemType}
                key={index}
                name={name}
                countryCode={country_code}
                datacenters={groups}
                searchFilteredDatacenters={groupMatches || groups}
                isLocationMatchedInSearch={isLocationMatched}
                isSearching={searchText && searchText.length > 0}
                currentDatacenterId={currentDatacenterId}
                cursorListItemInfo={maybeCursorListItemInfo}
                dispatch={dispatch}
                isExpanded={expandedLocations.has(id)}
                onDatacenterSelected={onDatacenterSelected}
                onHeartIconClick={onHeartIconClick}
                favourites={favourites}
                favouritesList={favouritesList}
                isProOnly={premium_only === 1}
                isUserPro={isUserPro}
              />
            )
          },
        )}
      </div>
    </div>
  )
}
