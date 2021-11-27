import React from 'react'
import { css } from '@emotion/core'
import { useDispatch, useConnect } from 'ui/hooks'
import { actions } from 'state'
import styled from '@emotion/styled'
import LeftArrow from 'assets/left-arrow-icon.svg'
import { Flex, Text } from '@rebass/emotion'
import { IconButton } from 'ui/Button'
import { WithToolTip } from 'components/Utils'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import SearchInput from './SearchInput'

const BackArrowContainer = styled(IconButton)`
  svg {
    width: 12px;
    height: 16px; /* ff weirdness */
  }
`

export default ({
  children,
  prefName,
  buttonProps,
  additionalIconProps,
  additionalIconTip,
  showBackButton = true,
  AdditionalIcon,
  noShadow = false,
  invert = false,
  usePrimary = false,
  shouldGoBack = true,
  searchInput = false,
  searchInputOnChange = () => {},
  searchInputClose = () => {},
  focusInitKey = null,
  ...restProps
}) => {
  const { colors } = useTheme(ThemeContext)
  const view = useConnect(s => s.view)
  const dispatch = useDispatch()
  const goBack = () =>
    dispatch(actions.scrollToConnected.set(true)) &&
    dispatch(actions.view.back())
  const [prevPage] = view.previous.reverse()
  const iconProps = {
    css: {
      '& > path': {
        fill: usePrimary
          ? colors.white
          : invert
          ? colors.iconBg
          : colors.iconFg,
      },
    },
    ...additionalIconProps,
  }

  return (
    <Flex
      {...restProps}
      flexDirection="column"
      css={
        !noShadow &&
        css`
          box-shadow: 0 2px 0 ${colors.divider};
        `
      }
    >
      <Flex
        p={3}
        css={css`
          place-content: space-between;
        `}
      >
        {showBackButton && (
          <BackArrowContainer
            aria-label={`Back to ${prevPage}`}
            onClick={shouldGoBack ? goBack : undefined}
            css={css`
              background: ${invert ? colors.bg : colors.iconBg} !important;
            `}
          >
            <LeftArrow
              css={css`
                path {
                  fill: ${colors.fg};
                }
              `}
            />
          </BackArrowContainer>
        )}
        <Flex
          mr={AdditionalIcon ? 0 : 3}
          css={css`
            flex: 1 1;
            justify-content: center;
            align-items: center;
          `}
        >
          <Text
            fontSize={4}
            fontWeight="bold"
            css={css`
              color: ${invert ? colors.white : colors.fg};
            `}
          >
            {prefName}
          </Text>
        </Flex>
        {
          /* TODO: AdditionalIcon is very specific and confusing. Abstract better. */
          AdditionalIcon && (
            <WithToolTip tip={additionalIconTip}>
              <IconButton
                aria-label={additionalIconTip}
                css={css`
                  background: ${usePrimary
                    ? colors.primary
                    : invert
                    ? colors.bg
                    : colors.iconBg} !important;
                `}
                {...buttonProps}
              >
                <AdditionalIcon {...iconProps} />
              </IconButton>
            </WithToolTip>
          )
        }
        {searchInput && (
          <SearchInput
            searchInputOnChange={searchInputOnChange}
            searchInputClose={searchInputClose}
            focusInitKey={focusInitKey}
          />
        )}
      </Flex>
      <Flex>{children}</Flex>
    </Flex>
  )
}
