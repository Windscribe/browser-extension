// @ts-nocheck
import React from 'react'
import { Flex, Box } from '@rebass/emotion'
import DatacenterListItem from './DatacenterListItem'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import BrokenHeart from 'assets/heartbreak.svg'

/**
 * List of locations that the user has saved as favourites.
 */
function FavouritesList({
  favourites,
  onDatacenterSelected,
  onHeartIconClick,
  isUserPro,
  locationLoadEnabled,
}) {
  const theme = useTheme(ThemeContext)
  return (
    <Flex
      css={{
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      {favourites.length === 0 && (
        <Flex
          css={{
            height: '100%',
            minHeight: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.fgLight,
          }}
        >
          <Flex
            css={{
              flexDirection: 'column',
              alignItems: 'center',
              '& > :not(:last-child)': {
                marginBottom: theme.space[3],
              },
              fontSize: theme.fontSizes[0],
            }}
          >
            <BrokenHeart css={{ opacity: '0.5' }} />
            <Box>Nothing to see here</Box>
          </Flex>
        </Flex>
      )}
      <Box css={{ paddingLeft: theme.space[4], height: '100%', width: '100%' }}>
        {favourites.map((favourite, index) => {
          const {
            dataCenterId,
            name,
            nickname,
            isCenterPro,
            health,
          } = favourite
          return (
            <DatacenterListItem
              // this is used for programmatically scrolling to a location, which we don't need to do
              // in the favourites list
              elementRef={null}
              key={index}
              hasCursor={false}
              city={name}
              health={health}
              id={dataCenterId}
              isFavourite={true}
              nick={nickname}
              onClick={() => onDatacenterSelected(dataCenterId)}
              onHeartIconClick={() => onHeartIconClick(dataCenterId)}
              isUserPro={isUserPro}
              isProOnly={isCenterPro}
              locationLoadEnabled={locationLoadEnabled}
            />
          )
        })}
      </Box>
    </Flex>
  )
}

export default FavouritesList
