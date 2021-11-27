import React, { useCallback } from 'react'
import { SimpleButton } from 'ui/Button'
import styled from '@emotion/styled'
import ExternalLinkSvg from 'assets/external-link-icon-copy-4.svg'
import websiteLink from 'utils/websiteLink'
import { Flex, Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { useTheme, useConnect, useDispatch } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { actions } from 'state'
import { IS_CHROME } from 'utils/constants'

const ExternalLink = styled(ExternalLinkSvg)`
  margin-left: ${({ theme }) => theme.space[2]};
  fill: ${({ color }) => color};
  opacity: 0.25;
`
const Button = styled(SimpleButton)`
  background-color: ${({ bgcolor }) => bgcolor};
  border-radius: 6px;
  padding: 0 0;
  width: 100%;
  &:hover {
    background-color: ${({ theme }) => theme.colors.fg};
    div {
      color: ${({ theme }) => theme.colors.bg};
    }
    svg {
      fill: ${({ theme }) => theme.colors.bg};
    }
  }
`
export default ({ bgColor, color, text, subtext, path, isPro }) => {
  const { space, fontSizes } = useTheme(ThemeContext)
  const { session_auth_hash } = useConnect(s => s.session)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const platform = IS_CHROME ? 'chrome' : 'firefox'
  const cpid = IS_CHROME ? 'ext_chrome' : 'ext_firefox'

  const gotoLink = useCallback(() => {
    dispatch(actions.view.back())
    if (isPro) {
      websiteLink({ path: 'upgrade', params: { pcpid: 'upgrade_ext1' } })
    } else {
      websiteLink({
        path,
        includeHash: false,
        params: {
          ghost_token: session_auth_hash,
          cpid: cpid,
          platform: platform,
        },
      })
    }
  }, [dispatch, isPro, path, session_auth_hash, cpid, platform])

  return (
    <Button bgcolor={bgColor} onClick={gotoLink}>
      <Flex flexDirection="row" justifyContent="space-between" width="100%">
        <Text
          color={color}
          py={space[4]}
          ml={space[4]}
          fontSize={fontSizes[1]}
          fontWeight="bold"
        >
          {t(text)}
        </Text>
        <Flex flexDirection="row" mr={space[4]} py={space[4]}>
          <Flex alignItems="center" color={color} opacity={0.5}>
            {t(subtext)}
          </Flex>
          <ExternalLink color={color} />
        </Flex>
      </Flex>
    </Button>
  )
}
