import React, { useRef, memo } from 'react'
import { useClientRect } from 'ui/hooks'
import { WithToolTip } from 'components/Utils'
import { Text, Flex } from '@rebass/emotion'
import { css } from '@emotion/core'

const maxHostnameWidth = 240

export default memo(({ hostname, color }) => {
  const ref = useRef(null)
  const { width } = useClientRect(ref)
  return (
    <WithToolTip
      tip={hostname}
      showOnOverflow
      elWidth={width}
      maxWidth={maxHostnameWidth}
    >
      <Flex
        tabIndex={0}
        p={3}
        flex={2}
        css={css`
          max-width: 282px;
        `}
      >
        <Text
          css={css`
            text-overflow: ellipsis;
            overflow: hidden;
            max-width: ${maxHostnameWidth}px;
            white-space: nowrap;
          `}
          ref={ref}
          notranslate="true"
          fontWeight="bold"
          fontSize={1}
          color={color}
        >
          {hostname}
        </Text>
      </Flex>
    </WithToolTip>
  )
})
