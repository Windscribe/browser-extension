// @ts-nocheck
import React from 'react'
import BaseListItem from './BaseListItem'
import { Flex, Box } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext, css } from '@emotion/core'
import AutoPilotIcon from 'assets/autopilot-icon.svg'
import Arrow from 'assets/right-arrow-icon.svg'

/**
 * List item for autopilot (automatically selected nearby location)
 */
export default function AutopilotListItem({ hasCursor, onClick, elementRef }) {
  const theme = useTheme(ThemeContext)
  return (
    <BaseListItem
      elementRef={elementRef}
      hasCursor={hasCursor}
      onClick={onClick}
      css={[
        {
          ':hover .datacenter-list-item-arrow': {
            path: {
              fill: theme.colors.fg,
            },
          },
          fontWeight: 'bold',
        },
        autopilotIconAnimation,
      ]}
    >
      <Flex
        css={{
          '& > :not(:last-child)': {
            marginRight: '16px',
          },
          marginRight: '16px',
        }}
      >
        <AutoPilotIcon
          // 16px + 5px vertical padding for animation on hover
          height={21}
          width={32}
          css={{
            '& > path': {
              fill: theme.colors.fg,
            },
          }}
        />
        <Flex css={{ alignItems: 'center' }}>Autopilot</Flex>
        <Box css={{ flex: '1' }} />
        <Flex css={{ alignItems: 'center' }}>
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
        </Flex>
      </Flex>
    </BaseListItem>
  )
}

const autopilotIconAnimation = css`
* .plane {
  animation-name: planemoves;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  transform-origin: 50% 50%;
  animation-play-state: paused;
  
}
&:hover .plane {
  animation-play-state: running;
}
@keyframes planemoves {
  0% {
    transform: translate(0, -2px);
  }
  50% {
    transform: translate(0, 2px);
  }
  100% {
    transform: translate(0, -2px);
  }
`
