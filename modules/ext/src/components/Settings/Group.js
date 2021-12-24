import React, { useRef } from 'react'
import { Flex, Text } from '@rebass/emotion'
import styled from '@emotion/styled'
import { useTheme } from 'ui/hooks'
import { WithToolTip } from 'components/Utils'
import { css, ThemeContext } from '@emotion/core'

const GroupTitle = styled(Text)`
  letter-spacing: 2px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.fgLight};
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const SettingGroup = ({
  children,
  groupName,
  groupNameTip = null,
  ...props
}) => {
  const titleRef = useRef(null)
  const { colors } = useTheme(ThemeContext)
  const width = groupName === undefined ? 0 : '100%'
  return (
    <Flex flexDirection="column" p={0} {...props}>
      <WithToolTip tip={groupNameTip} showOnOverflow>
        <GroupTitle
          css={css`
            position: relative;
            top: 12px;
            z-index: 1;
          `}
          pt={1}
          pb={2}
          fontSize={0}
          ref={titleRef}
          bg={colors.darkgrey}
          width={width}
        >
          {groupName}
        </GroupTitle>
      </WithToolTip>
      {children}
    </Flex>
  )
}

export default SettingGroup
