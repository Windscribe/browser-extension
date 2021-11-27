// @ts-nocheck
/** @jsx jsx */
import { jsx, ThemeContext } from '@emotion/core'
import { Box, Flex } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import BaseListItem from './BaseListItem'
import Heart from 'assets/heart.svg'
import HeartOutline from 'assets/heart-outline.svg'
import { InlineButton } from 'ui/Button'
import styled from '@emotion/styled'
import ProLocationIcon from 'assets/star.svg'
import Arrow from 'assets/right-arrow-icon.svg'
import DownIcon from 'assets/locationIcons/dc_down.svg'

/**
 * List item for an individual datacenter (inside a location). Can be clicked or toggled as
 * a favourite.
 */
export default function DatacenterListItem({
  onClick,
  nick,
  city,
  id,
  isFavourite,
  onHeartIconClick,
  elementRef,
  hasCursor,
  isUserPro,
  isProOnly,
  isDisabled = false,
}) {
  const theme = useTheme(ThemeContext)

  const icon = (() => {
    if (isDisabled) {
      if (!isUserPro && isProOnly) {
        return <ProLocationIcon fill={theme.colors.fg} />
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
            <Heart fill={theme.colors.fg} />
          ) : (
            <HeartOutline fill={theme.colors.fgLight} />
          )}
        </FaveIcon>
      )
    } else {
      return <ProLocationIcon fill={theme.colors.fg} />
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
            fill: theme.colors.fg,
          },
        },
        ':hover .datacenter-list-item-upgrade-text': {
          opacity: '1.0',
        },
      }}
    >
      <Flex
        css={{
          flexDirection: 'row',
          '& > :not(:last-child)': {
            marginRight: theme.space[4],
          },
          marginRight: theme.space[4],
        }}
      >
        {icon}
        <Flex css={{ alignItems: 'center' }} aria-label={city}>
          {city}
          <span css={{ fontWeight: 'bold', marginLeft: theme.space[2] }}>
            {nick}
          </span>
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
                  fill: hasCursor ? theme.colors.fg : theme.colors.divider,
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
    </BaseListItem>
  )
}

const FaveIcon = styled(InlineButton)`
  opacity: ${({ active = false }) => (active ? 1 : 0.3)};
`
