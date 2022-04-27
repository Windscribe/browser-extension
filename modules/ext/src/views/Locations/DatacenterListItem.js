// @ts-nocheck
/** @jsx jsx */
import { jsx, ThemeContext } from '@emotion/core'
import { Box, Flex, Text } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import BaseListItem from './BaseListItem'
import Heart from 'assets/heart.svg'
import HeartOutline from 'assets/heart-outline.svg'
import { InlineButton } from 'ui/Button'
import styled from '@emotion/styled'
import ProLocationIcon from 'assets/star.svg'
import Arrow from 'assets/right-arrow-icon.svg'
import DownIcon from 'assets/locationIcons/dc_down.svg'

const getHealthColor = (health, colors) => {
  if (health < 60) {
    return colors.green
  } else if (health < 89) {
    return colors.yellow
  } else {
    return colors.red
  }
}

/**
 * List item for an individual datacenter (inside a location). Can be clicked or toggled as
 * a favourite.
 */
export default function DatacenterListItem({
  onClick,
  nick,
  city,
  health,
  id,
  isFavourite,
  onHeartIconClick,
  elementRef,
  hasCursor,
  isUserPro,
  isProOnly,
  isDisabled = false,
  locationLoadEnabled,
}) {
  const { colors } = useTheme(ThemeContext)

  const icon = (() => {
    if (isDisabled) {
      if (!isUserPro && isProOnly) {
        return <ProLocationIcon fill={colors.fg} />
      } else {
        return (
          <Flex css={{ justifyContent: 'center', width: '32px' }}>
            <DownIcon />
          </Flex>
        )
      }
    } else if (isUserPro || !isProOnly) {
      return (
        <FaveIcon
          tabIndex={0}
          as="a"
          role="button"
          aria-label={`${
            isFavourite ? 'Unfavourite' : 'Favourite'
          } ${city}: ${nick}
                  }`}
          active={isFavourite}
          onClick={e => {
            e.stopPropagation()
            onHeartIconClick(id)
          }}
        >
          {isFavourite ? (
            <Heart fill={colors.fg} />
          ) : (
            <HeartOutline fill={colors.fgLight} />
          )}
        </FaveIcon>
      )
    } else {
      return <ProLocationIcon fill={colors.fg} />
    }
  })()

  return (
    <BaseListItem
      elementRef={elementRef}
      hasCursor={hasCursor}
      onClick={onClick}
      css={{
        ':hover .datacenter-list-item-arrow': {
          path: {
            fill: colors.fg,
          },
        },
        ':hover .datacenter-list-item-upgrade-text': {
          opacity: '1.0',
        },
        ':hover .datacenter-list-item-health-bar': {
          opacity: '1.0 !important',
        },
      }}
    >
      <Flex
        css={{
          flexDirection: 'row',
          margin: '16px 16px 16px 0',
        }}
      >
        {icon}
        <Flex css={{ alignItems: 'center' }} aria-label={city}>
          <Text css={{ fontWeight: '700' }} aria-label={city}>
            {city}
          </Text>
          <Text css={{ marginLeft: '8px' }}>{nick}</Text>
        </Flex>
        <Box css={{ flex: '1' }}></Box>
        <Flex css={{ alignItems: 'center' }}>
          {isUserPro || !isProOnly ? (
            <Arrow
              className="datacenter-list-item-arrow"
              width={16}
              height={16}
              css={{
                path: {
                  transitionProperty: 'fill',
                  transitionDuration: '0.2s',
                  fill: hasCursor ? colors.fg : colors.divider,
                },
              }}
            />
          ) : (
            <span
              className="datacenter-list-item-upgrade-text"
              css={{
                fontWeight: 'bold',
                transition: 'opacity 0.2s',
                opacity: '0.0',
              }}
            >
              UPGRADE
            </span>
          )}
        </Flex>
      </Flex>
      {locationLoadEnabled && (
        <Flex justifyContent={'space-between'}>
          <Box
            aria-label={'healthBar'}
            className="datacenter-list-item-health-bar"
            width={`${health}%`}
            height={'2px'}
            bg={getHealthColor(health, colors)}
            css={{
              opacity: '0.5',
              marginLeft: '8px',
            }}
          />
        </Flex>
      )}
    </BaseListItem>
  )
}

const FaveIcon = styled(InlineButton)`
  opacity: ${({ active = false }) => (active ? 1 : 0.3)};
`
