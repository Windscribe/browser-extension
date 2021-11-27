import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { Box, Flex, Text } from '@rebass/emotion'
import { InlineButton } from 'ui/Button'
import Arrow from 'assets/right-arrow-icon.svg'
import Check from 'assets/checkmark-icon.svg'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const Col = p => <Flex flexDirection="column" {...p} />
const iconSize = 15

const ToolTipContainer = styled(Box)`
  border-radius: 5px;
  text-align: center;
  z-index: 10000;
`

const NavArrow = styled(Arrow)`
  width: ${iconSize}px;
  height: ${iconSize}px;
`

const FinishedCheck = NavArrow.withComponent(Check)

const Divider = styled.span`
  width: 2px;
  height: 24px;
  position: relative;
  left: 0px;
  top: 18px;
`

export default ({
  index,
  step,
  backProps,
  skipProps,
  primaryProps,
  tooltipProps,
}) => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  return (
    <div {...tooltipProps}>
      <ToolTipContainer bg="white">
        <Col p={3} pb={1} alignItems="center" justifyContent="center">
          {step.content}
        </Col>
        <Flex alignItems="center" justifyContent="space-between">
          <Box flex={2} p={3}>
            <InlineButton {...skipProps}>
              <Text fontSize={'13px'}>{t('Leave')}</Text>
            </InlineButton>
          </Box>
          <Flex
            css={css`
              height: 50px;
            `}
            alignItems="center"
          >
            <InlineButton
              mr={1}
              css={css`
                visibility: ${index > 0 ? 'visible' : 'hidden'};
                width: 32px;
                height: 100%;
              `}
              {...backProps}
            >
              <NavArrow
                style={{
                  transform: 'rotate(180deg)',
                }}
              />
            </InlineButton>
            <Divider bg={'black'} />
            <InlineButton
              solid
              {...primaryProps}
              css={css`
                width: 32px;
                height: 100%;
              `}
              ml={1}
            >
              {primaryProps.title === 'Last' ? (
                <FinishedCheck fill={colors.primary} />
              ) : (
                <NavArrow fill={colors.primary} />
              )}
            </InlineButton>
          </Flex>
        </Flex>
      </ToolTipContainer>
    </div>
  )
}
