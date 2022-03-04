import React, { memo } from 'react'
import { Flex, Text } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from 'reselect'
import { startCase } from 'lodash'
import { actions } from 'state'

const selector = createSelector(
  s => s.currentLocation.name,
  s => s.currentLocation.nickname,
  (name, nickname) => {
    return {
      isCruiseControl: name === 'cruise_control',
      name,
      nickname,
    }
  },
)

export default memo(({ setIsHovering = false }) => {
  const { name, nickname, isCruiseControl } = useSelector(selector)

  const dispatch = useDispatch()

  const locationName = !isCruiseControl ? name : 'autopilot'

  const locationNickName = !isCruiseControl ? nickname : ''

  return (
    <Flex
      mt={'10px'}
      mb={isCruiseControl ? '6px' : '0px'}
      alignItems="center"
      css={css`
        cursor: ${'pointer'};
      `}
      onMouseEnter={() => setIsHovering && setIsHovering(true)}
      onMouseLeave={() => setIsHovering && setIsHovering(false)}
      onClick={() => dispatch(actions.view.set('Locations'))}
    >
      <div
        css={css`
          flex-direction: column;
          display: inline-flex;
          max-width: 170px;
        `}
      >
        <Text
          css={css`
            font-size: 16px;
          `}
          color={'white'}
          fontWeight="bold"
        >
          {startCase(locationName)}
        </Text>
        <Text
          mt={'10px'}
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
          `}
          fontSize={1}
          color={'white'}
        >
          {startCase(locationNickName)}
        </Text>
      </div>
    </Flex>
  )
})
