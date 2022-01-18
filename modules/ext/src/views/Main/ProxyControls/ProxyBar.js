import React, { memo, useCallback } from 'react'
import { cond } from 'lodash'
import { Box } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import Flags from 'assets/flags'
import FlagGradient from './FlagGradient'
import Desktop from './Desktop'
import Browser from './Browser'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const BAR_WIDTH = '324px'

const selector = createSelector(
  s => s.proxy.status,
  s => s.online,
  s => s.session.our_ip,
  s => s.session.our_dc,
  s => s.serverList,
  s => s.currentLocation.countryCode,
  (...xs) => xs,
)

export default memo(({ hoveringOnInterface, currentInterface }) => {
  const { colors } = useTheme(ThemeContext)
  const [status, online, our_ip, our_dc, serverList, countryCode] = useSelector(
    selector,
  )

  const translateProxyBar = useCallback(() => {
    const base = 30
    const { xCoord, offset } =
      currentInterface === 'os'
        ? { xCoord: -318, offset: base }
        : { xCoord: 0, offset: base * -1 }

    return hoveringOnInterface ? xCoord + offset : xCoord
  }, [currentInterface, hoveringOnInterface])

  return (
    <Box
      tabIndex={0}
      aria-label={`${currentInterface} control panel`}
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
          transform: translateX(${translateProxyBar()}px);
          transition: transform ease-out 0.3s;
          position: relative;
          z-index: 20;
        `}
      >
        <Browser currentInterface={currentInterface} />
        <Desktop
          style={{ transform: `translateX(${BAR_WIDTH})` }}
          currentInterface={currentInterface}
        />
      </Box>
      <FlagGradient
        Flag={
          Flags[
            currentInterface === 'browser'
              ? countryCode
              : our_ip &&
                serverList.data.find(loc =>
                  loc.groups?.find(x => x.id === our_dc),
                )?.country_code
          ]
        }
        opacity={
          currentInterface === 'os'
            ? our_ip
              ? 1
              : 0
            : cond([
                [() => status === 'disconnected', () => 0],
                [() => status === 'connected' && !online, () => 0.3],
                [() => status === 'connecting' || !online, () => 0.3],
                [() => status === 'connected' && online, () => 1],
              ])()
        }
      />
    </Box>
  )
})
