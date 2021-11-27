// @ts-nocheck
import { useTheme, useDispatch } from 'ui/hooks'
import { actions } from 'state'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SettingHeader, HeaderMenuItem } from 'components/Settings'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import LocationsList from './LocationsList'
import useLocationsListState from './useLocationsListState'
import { Flex, Box } from '@rebass/emotion'
import { css, ThemeContext } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import AllLocationsIcon from 'assets/locationIcons/all-locations.svg'
import FavLocationsIcon from 'assets/locationIcons/fav-locations.svg'
import SortButton from './SortButton'
import { debounce, shuffle } from 'lodash'
import FavouritesList from './FavouritesList'
import pickHosts from 'utils/pickHosts'
import websiteLink from 'utils/websiteLink'
import { getFuzzyCoords } from 'utils/coords'

/**
 * List of locations and datacenters, as well as datacenters saved as favourites. The list
 * can be search filtered and sorted, and navigated via keyboard controls.
 */
export default function Locations() {
  const selector = createSelector(
    s => s.serverList,
    s => s.favoriteLocations,
    s => s.proxy,
    s => s.currentLocation,
    s => s.session,
    s => s.locationSorting,
    (...xs) => xs,
  )
  const [
    serverList,
    favoriteLocations,
    proxy,
    currentLocation,
    session,
    locationSorting,
  ] = useSelector(selector)
  const globalDispatch = useDispatch()

  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)

  const [currentView, setCurrentView] = useState('locations')

  // used to track the first key press to pass as initial input to search field
  const [focusInitKey, setFocusInitKey] = useState(null)

  // local state not associated with global Redux store - for things like keyboard cursor,
  // sorting, searching and expanding / collapsing
  const [locationsListState, locationsListDispatch] = useLocationsListState(
    serverList.data,
    proxy.status === 'connected' ? currentLocation.dataCenterId : null,
    locationSorting,
  )

  // a ref to the container of the locations and favourites lists, which is used for
  // programmatic scrolling
  const scrollContainerRef = useRef(null)

  const connectToLocation = useCallback(
    location => {
      globalDispatch(actions.proxy.assign({ status: 'connecting' }))
      location.hosts = shuffle(location.hosts)
      globalDispatch(actions.scrollToConnected.set(true))
      globalDispatch(actions.currentLocation.set(location))
      globalDispatch(actions.view.set('Main'))
      //clear the lastAuthErrorReset
      globalDispatch(
        actions.lastAuthErrorReset.set({
          timestamp: '',
          errorCount: 0,
        }),
      )
      globalDispatch(actions.proxy.activate({ logActivity: 'location_select' }))
      globalDispatch(actions.session.get())
    },
    [globalDispatch],
  )

  const getDatacenter = useCallback(
    datacenterId => {
      for (let i = 0; i < serverList.data.length; i++) {
        const location = serverList.data[i]
        for (let j = 0; j < location.groups.length; j++) {
          const datacenter = location.groups[j]
          if (datacenter.id === datacenterId) {
            return [location, datacenter]
          }
        }
      }

      return null
    },
    [serverList.data],
  )

  const onDatacenterSelected = useCallback(
    datacenterId => {
      const [location, datacenter] = getDatacenter(datacenterId)
      const { city, gps, nick, tz, hosts, pro } = datacenter
      const coords = getFuzzyCoords(gps)
      const canAccess = session.is_premium || datacenter.pro === 0
      if (canAccess) {
        if (!hosts || hosts.length === 0) {
          globalDispatch(actions.view.set('LocationDown'))
        } else {
          connectToLocation({
            name: city,
            nickname: nick,
            countryCode: location.country_code,
            timezone: tz,
            locationId: location.id,
            dataCenterId: datacenterId,
            gps,
            coords,
            hosts: pickHosts(hosts),
            isDatacenter: true,
            isCenterPro: pro === 1,
          })
        }
      } else {
        websiteLink({ path: 'upgrade', params: { pcpid: 'upgrade_ext1' } })
      }
    },
    [connectToLocation, getDatacenter, globalDispatch, session.is_premium],
  )

  // passed in to the locations list to update the scroll location on keyboard navigation
  const setScrollTop = useCallback(scrollTop => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollTop - 215
    }
  }, [])

  const onHeartIconClick = useCallback(datacenterId => {
    const [location, datacenter] = getDatacenter(datacenterId)
    const { city, nick, gps, hosts, pro } = datacenter
    const { country_code } = location
    globalDispatch(
      actions.favoriteLocations.toggle({
        name: city,
        nickname: nick,
        gps,
        hosts: pickHosts(hosts),
        countryCode: country_code,
        isCenterPro: pro === 1,
        dataCenterId: datacenter.id,
        locationId: location.id,
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onAutopilotSelected = useCallback(() => {
    connectToLocation({
      name: 'cruise_control',
      nickname: '',
      countryCode: 'AUTO',
      hosts: [],
      isDatacenter: false,
    })
  }, [connectToLocation])

  // if the user types an alphabetical character it sets focus to the search input
  useEffect(() => {
    const isLetter = e => {
      const charCode = e.keyCode
      return (
        (charCode > 64 && charCode < 91) ||
        (charCode > 96 && charCode < 123) ||
        charCode === 8
      )
    }
    const onKeypress = e => {
      const validKey = isLetter(e)
      if (validKey) {
        setFocusInitKey(e.key)
      }
    }
    window.addEventListener('keypress', onKeypress)
    return () => window.removeEventListener('keypress', onKeypress)
  }, [])

  useEffect(() => {
    // clear the search input when we change between tabs (locations, favourites)
    setFocusInitKey(null)
  }, [locationsListState.view])

  // remove favourites if they are no longer in the master server list
  useEffect(() => {
    favoriteLocations.forEach(favoriteLocation => {
      let favouriteExistsStill = false
      serverList.data.forEach(location => {
        if (location.id === favoriteLocation.locationId) {
          location.groups.forEach(datacenter => {
            if (datacenter.id === favoriteLocation.dataCenterId) {
              favouriteExistsStill = true
            }
          })
        }
      })

      if (!favouriteExistsStill) {
        globalDispatch(
          actions.favoriteLocations.toggle({
            ...favoriteLocation,
            logActivity: 'locations',
          }),
        )
      }
    })
  }, [favoriteLocations, globalDispatch, serverList.data])

  // debounce to prevent lagginess from spamming searches on every keypress
  const debouncedSetSearchText = useMemo(() => {
    return debounce(searchText => {
      locationsListDispatch({ type: 'setSearchText', payload: { searchText } })
    }, 250)
  }, [locationsListDispatch])

  const isSearching =
    locationsListState.searchText && locationsListState.searchText.length > 0

  return (
    <Flex
      flexDirection="column"
      bg={colors.bg}
      css={css`
        max-height: 433px !important;
      `}
    >
      <SettingHeader
        role="tablist"
        prefName={t('Locations')}
        searchInput={currentView === 'locations'}
        focusInitKey={focusInitKey}
        searchInputOnChange={event => {
          debouncedSetSearchText(event.target.value)
        }}
        searchInputClose={() => {
          setFocusInitKey(null)
          locationsListDispatch({
            type: 'setSearchText',
            payload: {
              searchText: '',
            },
          })
        }}
      >
        <Flex
          css={css`
            width: 100%;
          `}
        >
          <HeaderMenuItem
            role="tab"
            aria-selected={currentView === 'locations'}
            active={currentView === 'locations'}
            onClick={() => setCurrentView('locations')}
          >
            <AllLocationsIcon fill={colors.fg} />
          </HeaderMenuItem>
          {!isSearching && (
            <HeaderMenuItem
              role="tab"
              aria-selected={currentView === 'favourites'}
              active={currentView === 'favourites'}
              onClick={() => setCurrentView('favourites')}
            >
              <FavLocationsIcon fill={colors.fg} />
            </HeaderMenuItem>
          )}
          {currentView === 'locations' && !isSearching && (
            <SortButton
              sortBy={locationSorting}
              onClick={() => {
                const newSortBy =
                  locationSorting === 'geography' ? 'alphabet' : 'geography'

                // use Redux dispatch to store our sort order preference
                globalDispatch(actions.locationSorting.set(newSortBy))

                // and the local locations list dispatch to actually re-order the locations
                locationsListDispatch({
                  type: 'setSortBy',
                  payload: {
                    sortBy: newSortBy,
                  },
                })
              }}
            />
          )}
        </Flex>
      </SettingHeader>
      <Box
        // `react-custom-scrollbars` is a pure Javascript custom scrollbar solution and while it
        // enables OS X style scrollbars (overlay) on Windows, pure CSS is much more performant
        // so we use a thin, fixed-gutter custom scrollbar for this list
        css={css`
          height: 315px;
          overflow-y: auto;
          overflow-x: hidden;
          /* For firefox */
          scrollbar-color: ${colors.inactive} ${colors.bg};
          scrollbar-width: thin;
          /*for chrome */
          &::-webkit-scrollbar {
            width: 10px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: ${colors.inactive};
            border: 2px solid ${colors.bg};
          }
          &::-webkit-scrollbar-track {
            border: 2px solid ${colors.bg};
          }
        `}
        ref={scrollContainerRef}
      >
        {
          {
            locations: (
              <LocationsList
                setScrollTop={setScrollTop}
                onDatacenterSelected={onDatacenterSelected}
                onAutopilotSelected={onAutopilotSelected}
                onHeartIconClick={onHeartIconClick}
                state={locationsListState}
                dispatch={locationsListDispatch}
                favouritesList={favoriteLocations}
                currentDatacenterId={currentLocation.dataCenterId}
                isConnected={proxy.status === 'connected'}
                initialSortBy={locationSorting}
                isUserPro={session.is_premium}
              />
            ),
            favourites: (
              <FavouritesList
                favourites={favoriteLocations}
                state={locationsListState}
                onDatacenterSelected={onDatacenterSelected}
                onHeartIconClick={onHeartIconClick}
                isUserPro={session.is_premium}
              />
            ),
          }[currentView]
        }
      </Box>
    </Flex>
  )
}
