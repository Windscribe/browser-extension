import React, { memo, useEffect } from 'react'
import { cond } from 'lodash'
import { Box } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from 'reselect'
import Flags from 'assets/flags'
import FlagGradient from './FlagGradient'
import Browser from './Browser'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { actions } from 'state'

const BAR_WIDTH = '324px'

const selector = createSelector(
  s => s.proxy.status,
  s => s.online,
  s => s.currentLocation.countryCode,
  s => s.session.our_ip,
  (...xs) => xs,
)

export default memo(() => {
  const dispatch = useDispatch()
  const { colors } = useTheme(ThemeContext)
  const [status, online, countryCode, our_ip] = useSelector(selector)

  useEffect(() => {
    dispatch(actions.desktopClient.fetch())
  }, [dispatch, our_ip, status])

  return (
    <Box
      tabIndex={0}
      aria-label={`browser control panel`}
      css={css`
        position: relative;
        height: 160px;
        width: ${BAR_WIDTH};
      `}
      bg={colors.black}
    >
      <Box
        css={css`
          height: 100%;
          width: 100%;
          position: relative;
          z-index: 20;
        `}
      >
        <Browser />
      </Box>
      <FlagGradient
        Flag={Flags[countryCode] || Flags['AUTO']}
        opacity={cond([
          [() => status === 'disconnected', () => 0],
          [() => status === 'connected' && !online, () => 0.3],
          [() => status === 'connecting' || !online, () => 0.3],
          [() => status === 'connected' && online, () => 1],
        ])()}
      />
    </Box>
  )
})
