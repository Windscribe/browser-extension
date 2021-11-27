// @ts-nocheck
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import styled from '@emotion/styled'
import { useConnect, useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { memo, useEffect, useRef, useState } from 'react'
import flags from 'assets/flags'
import BaseListItem from './BaseListItem'
import { Flex, Box } from '@rebass/emotion'
import DatacenterListItem from './DatacenterListItem'
import ProCountryIconDark from 'assets/pro-flag-icon-dark.svg'
import ProCountryIconLight from 'assets/pro-flag-icon-light.svg'
import PlusIcon from 'assets/plus-icon.svg'

/**
 * List item for a location, which can contain datacenters and can expand and collapse.
 *
 * Datacenters are only rendered on the first expand, to improve the initial loading time
 * for the locations list. To further improve this loading time, we can use a virtualized
 * list at a later time.
 */
const LocationListItem = memo(
  ({
    id,
    name,
    datacenters,
    searchFilteredDatacenters,
    isLocationMatchedInSearch,
    isSearching,
    idsToRefsByListItemType,
    cursorListItemInfo,
    dispatch,
    isExpanded,
    onDatacenterSelected,
    onHeartIconClick,
    favouritesList,
    countryCode,
    isProOnly,
    isUserPro,
  }) => {
    const [datacentersHeight, setDatacentersHeight] = useState(null)
    const dataCentersRef = useRef(null)

    const [hasExpandedOnce, setHasExpandedOnce] = useState(isExpanded)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      // on first render, we mark the height of the datacenters for this location in
      // order to later conditionally set `max-height` on expand/collapse
      setDatacentersHeight(dataCentersRef.current?.scrollHeight)
    }, [datacenters, hasExpandedOnce])

    const isExpandedOrSearchOnlyMatchesDatacenter =
      isExpanded || (isSearching && !isLocationMatchedInSearch)
    useEffect(() => {
      // if it's either been expanded, or the user has searched and it matches only one or more
      // *datacenters* and not the *location* (which forces it to be open)
      if (isExpandedOrSearchOnlyMatchesDatacenter) {
        setHasExpandedOnce(true)
      }
    }, [isExpandedOrSearchOnlyMatchesDatacenter])

    const Flag = flags[countryCode]
    const theme = useTheme(ThemeContext)

    const hasCursor =
      cursorListItemInfo?.type === 'location' && cursorListItemInfo?.id === id
    return (
      <div>
        <BaseListItem
          elementRef={idsToRefsByListItemType.location[id]}
          onClick={() => {
            dispatch({
              type: 'toggleIsLocationExpanded',
              payload: {
                locationId: id,
              },
            })

            if (!isSearching) {
              dispatch({
                type: 'setKeyboardCursorToLocation',
                payload: {
                  locationId: id,
                },
              })
            }
          }}
          hasCursor={hasCursor}
          css={{
            borderBottom: `2px solid ${
              isExpandedOrSearchOnlyMatchesDatacenter
                ? theme.colors.fg
                : theme.colors.divider
            }`,
            ':hover .expand-collapse-button': {
              path: {
                fill: theme.colors.fg,
              },
            },
            fontWeight: 'bold',
          }}
        >
          <Flex
            css={{
              '& > :not(:last-child)': {
                marginRight: '16px',
              },
            }}
          >
            <FlagIcon
              Svg={Flag}
              isExpanded={isExpandedOrSearchOnlyMatchesDatacenter}
              shouldShowProOnlyIcon={isProOnly && !isUserPro}
            />
            <Flex css={{ alignItems: 'center' }} aria-label={name}>
              {name}
            </Flex>
            <Box css={{ flex: '1' }}></Box>
            {(!isSearching || isLocationMatchedInSearch) && (
              <div
                className="expand-collapse-button"
                css={{
                  flex: '0',
                  marginRight: '16px',
                  path: {
                    transition: 'fill 0.2s',
                    fill: hasCursor ? theme.colors.fg : theme.colors.divider,
                  },
                }}
              >
                <ExpandIconContainer expanded={isExpanded}>
                  <PlusIcon className="add-icon" />
                </ExpandIconContainer>
              </div>
            )}
          </Flex>
        </BaseListItem>
        <div
          ref={dataCentersRef}
          css={css`
            max-height: ${isExpandedOrSearchOnlyMatchesDatacenter
              ? datacentersHeight
              : 0}px;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
          `}
        >
          {hasExpandedOnce &&
            (isLocationMatchedInSearch
              ? datacenters
              : searchFilteredDatacenters
            ).map(({ nick, city, id, pro, hosts }, index) => {
              const isFavourite =
                favouritesList.findIndex(favourite => {
                  return favourite.dataCenterId === id
                }) !== -1
              return (
                <DatacenterListItem
                  key={index}
                  nick={nick}
                  city={city}
                  id={id}
                  isFavourite={isFavourite}
                  onHeartIconClick={() => onHeartIconClick(id)}
                  elementRef={idsToRefsByListItemType.datacenter[id]}
                  hasCursor={
                    cursorListItemInfo?.type === 'datacenter' &&
                    cursorListItemInfo?.id === id
                  }
                  onClick={() => onDatacenterSelected(id)}
                  isUserPro={isUserPro}
                  isProOnly={pro === 1}
                  isDisabled={!hosts || hosts.length === 0}
                />
              )
            })}
        </div>
      </div>
    )
  },
)

function FlagIcon({ Svg, isExpanded, shouldShowProOnlyIcon = false }) {
  const theme = useTheme(ThemeContext)

  const lightOrDark = useConnect(state => state.theme)
  const ProOnlyIcon =
    lightOrDark === 'light' ? ProCountryIconDark : ProCountryIconLight
  return (
    <div
      css={{
        position: 'relative',
        width: '32px',
      }}
    >
      <Svg
        height={16}
        width={32}
        css={{
          boxShadow: `2px 2px 0px ${
            isExpanded ? theme.colors.fgLight : theme.colors.iconBg
          }`,
          position: 'absolute',
          left: '0px',
          transition: 'box-shadow 0.2s',
        }}
      />
      {shouldShowProOnlyIcon && (
        <ProOnlyIcon
          css={{
            position: 'absolute',
            left: '-4px',
            bottom: '6px',
          }}
        />
      )}
    </div>
  )
}

export default LocationListItem

const ExpandIconContainer = styled(Box)`
  z-index: 10;
  transition: transform ease-in-out 0.2s;
  display: flex;
  align-items: center;
  ${({ expanded = false }) => ({
    transform: `rotate(${expanded ? '45deg' : '0'})`,
  })};
`
