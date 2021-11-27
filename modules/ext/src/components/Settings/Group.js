import React, { useRef } from 'react'
import { Flex, Text } from '@rebass/emotion'
import styled from '@emotion/styled'
import { useClientRect } from 'ui/hooks'
import { WithToolTip } from 'components/Utils'
import { css } from '@emotion/core'

const MAX_TITLE_WIDTH = 275

const GroupTitle = styled(Text)`
  letter-spacing: 2px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.fgLight};
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: fit-content;
  max-width: ${MAX_TITLE_WIDTH}px;
`

const SettingGroup = ({
  children,
  groupName,
  groupNameTip = null,
  ...props
}) => {
  const titleRef = useRef(null)
  const { width: titleWidth } = useClientRect(titleRef)

  return (
    <Flex flexDirection="column" p={0} {...props}>
      <WithToolTip
        tip={groupNameTip}
        showOnOverflow
        elWidth={titleWidth}
        maxWidth={MAX_TITLE_WIDTH}
      >
        <GroupTitle
          css={css`
            position: relative;
            top: 12px;
          `}
          pt={1}
          pb={2}
          fontSize={0}
          ref={titleRef}
        >
          {groupName}
        </GroupTitle>
      </WithToolTip>
      {children}
    </Flex>
  )
}

export default SettingGroup
