import React, { useRef } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { useClientRect, useTheme } from 'ui/hooks'
import { WithToolTip } from 'components/Utils'
import { Box, Flex, Text } from '@rebass/emotion'
import Toggle from 'ui/Toggle'
import websiteLink from 'utils/websiteLink'
import SmallLinkIcon from 'assets/ext-link-small.svg'
import { ThemeContext } from '@emotion/core'

const MAX_HEADING_WIDTH = 220

const linkedHeader = css`
  cursor: pointer;
  &:hover {
    & > .link-out-icon {
      opacity: 1;
    }
  }
`

const SettingHeading = styled(Text)`
  color: ${({ theme }) => theme.colors.fg};
  width: fit-content;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: ${MAX_HEADING_WIDTH}px;
  ${({ hasLink = false }) => hasLink && linkedHeader}
`

const SubText = styled(Text)`
  color: ${({ theme }) => theme.colors.fgLight};
`

export default ({
  title,
  subHeading,
  noBorder = false,
  ControlComponent = Toggle,
  SelectComponent = null,
  headingTip = null,
  linkPath,
  ...props
}) => {
  const { colors } = useTheme(ThemeContext)
  const headingRef = useRef(null)
  const { width: headingWidth } = useClientRect(headingRef)
  return (
    <Flex
      flexDirection="column"
      py={3}
      className="setting-item-container"
      css={css`
        border-bottom-width: 2px;
        border-bottom-style: solid;
        border-bottom-color: ${!noBorder ? colors.divider : 'transparent'};
        width: 100%;
      `}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        css={css`
          flex: 1;
        `}
      >
        <Flex
          flexDirection="column"
          css={css`
            max-width: 230px;
          `}
        >
          <Box>
            <WithToolTip
              tip={headingTip}
              showOnOverflow
              elWidth={headingWidth}
              maxWidth={MAX_HEADING_WIDTH}
            >
              <SettingHeading
                fontSize={1}
                fontWeight="bold"
                ref={headingRef}
                className="setting-heading"
                hasLink={!!linkPath}
                onClick={() => {
                  if (linkPath) {
                    websiteLink({
                      path: linkPath,
                      includeHash: false,
                    })
                  }
                }}
              >
                {title}

                {linkPath && (
                  <Box
                    className="link-out-icon"
                    ml={2}
                    css={css`
                      display: inline;
                      opacity: 1;
                      transition: opacity 0.3s ease;
                    `}
                  >
                    <SmallLinkIcon fill={colors.fg} />
                  </Box>
                )}
              </SettingHeading>
            </WithToolTip>
          </Box>
          {subHeading && (
            <Box pt={0}>
              <SubText fontSize={0} pt={1}>
                {subHeading}
              </SubText>
            </Box>
          )}
        </Flex>
        <Flex flexDirection="column">
          <Box ml="auto">
            <ControlComponent {...props} />
          </Box>
        </Flex>
      </Flex>
      <Box>{SelectComponent && <SelectComponent />}</Box>
    </Flex>
  )
}
