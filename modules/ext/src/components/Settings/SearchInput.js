import React, { useState, createRef, useEffect, memo } from 'react'
import { Box } from '@rebass/emotion'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { css } from '@emotion/core'
import { useConnect } from 'ui/hooks'

const darkClose = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4gICAgPHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuNSIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNMTIgMGM2LjYyNyAwIDEyIDUuMzczIDEyIDEycy01LjM3MyAxMi0xMiAxMlMwIDE4LjYyNyAwIDEyIDUuMzczIDAgMTIgMHpNNy43MTQgNy43MTRhMS4wMSAxLjAxIDAgMCAwIDAgMS40MjlMMTAuNTcxIDEybC0yLjg1NyAyLjg1NmExLjAxIDEuMDEgMCAxIDAgMS40MjkgMS40MjlsMi44NTYtMi44NTcgMi44NTggMi44NTdhMS4wMSAxLjAxIDAgMCAwIDEuNDI5LTEuNDI5bC0yLjg1Ny0yLjg1NiAyLjg1Ny0yLjg1OGExLjAxIDEuMDEgMCAwIDAtMS40MjktMS40MjlMMTIgMTAuNTcxIDkuMTQzIDcuNzE0YTEuMDEgMS4wMSAwIDAgMC0xLjQyOSAweiIvPjwvc3ZnPg==`

const darkSearch = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij4gICAgPHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNiAxMGE0IDQgMCAxIDAgMC04IDQgNCAwIDAgMCAwIDh6TTYgMGE2IDYgMCAwIDEgNC43NjUgOS42NDdsNC42NTUgMy45NGExLjMwMSAxLjMwMSAwIDEgMS0xLjgzNCAxLjgzM2wtMy45MzktNC42NTVBNiA2IDAgMSAxIDYgMHoiLz48L3N2Zz4=`

const lightSearch = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij4gICAgPHBhdGggZmlsbD0iIzAyMEQxQyIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNiAxMGE0IDQgMCAxIDAgMC04IDQgNCAwIDAgMCAwIDh6TTYgMGE2IDYgMCAwIDEgNC43NjUgOS42NDdsNC42NTUgMy45NGExLjMwMSAxLjMwMSAwIDEgMS0xLjgzNCAxLjgzM2wtMy45MzktNC42NTVBNiA2IDAgMSAxIDYgMHoiLz48L3N2Zz4=`

const lightClose = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4gICAgPHBhdGggZmlsbD0iIzAyMEQxQyIgZmlsbC1vcGFjaXR5PSIuNSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMGM2LjYyNyAwIDEyIDUuMzczIDEyIDEycy01LjM3MyAxMi0xMiAxMlMwIDE4LjYyNyAwIDEyIDUuMzczIDAgMTIgMHpNNy43MTQgNy43MTRhMS4wMSAxLjAxIDAgMCAwIDAgMS40MjlMMTAuNTcxIDEybC0yLjg1NyAyLjg1NmExLjAxIDEuMDEgMCAxIDAgMS40MjkgMS40MjlsMi44NTYtMi44NTcgMi44NTggMi44NTdhMS4wMSAxLjAxIDAgMCAwIDEuNDI5LTEuNDI5bC0yLjg1Ny0yLjg1NiAyLjg1Ny0yLjg1OGExLjAxIDEuMDEgMCAwIDAtMS40MjktMS40MjlMMTIgMTAuNTcxIDkuMTQzIDcuNzE0YTEuMDEgMS4wMSAwIDAgMC0xLjQyOSAweiIvPjwvc3ZnPg==`

export default memo(
  ({ searchInputOnChange, searchInputClose, focusInitKey = null }) => {
    const theme = useConnect(s => s.theme)
    const inputRef = createRef()
    const { colors } = useTheme(ThemeContext)
    const [focused, setFocused] = useState(false)
    const [focusInitString, setFocusInitString] = useState('')

    useEffect(() => {
      setFocused(!!focusInitKey)
      if (!focusInitKey) {
        setFocusInitString('')
      } else {
        setFocusInitString(prevStr => prevStr + focusInitKey)
      }
    }, [focusInitKey])

    const mainIcon = _focused => {
      if (theme === 'dark') {
        if (_focused) {
          return darkClose
        }
        return darkSearch
      } else if (theme === 'light') {
        if (_focused) {
          return lightClose
        }
        return lightSearch
      }
    }

    return (
      <Box
        className={focused ? 'focused' : ''}
        css={css`
          top: 12px;
          right: 16px;
          position: absolute;
          background-color: ${colors.iconBgSolid};
          border-radius: 20px;
          transform-origin: 100% 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          transition: 250ms ease;

          &.focused {
            width: 75%;
            &:before {
              position: absolute;
              left: 8px;
              top: 8px;
              content: url(${mainIcon(!focused)});
            }
            input {
              box-sizing: border-box;
              font-size: 14px;
              padding-top: 12px;
              padding-left: 32px;
              width: 100%;
              transform: scale(1);
            }
          }
        `}
      >
        <input
          ref={inputRef}
          onFocus={e => {
            if (focusInitString.length > 0 && inputRef.current.value === '') {
              inputRef.current.value = focusInitString
              searchInputOnChange(e)
            }
          }}
          onBlur={e => {
            if (inputRef.current.value === '') {
              setFocused(false)
              e.stopPropagation()
            }
          }}
          onChange={searchInputOnChange}
          onTransitionEnd={() => {
            if (focused) {
              inputRef.current.focus()
            } else {
              inputRef.current.value = ''
              searchInputClose()
            }
          }}
          css={css`
            background: transparent;
            border: 0;
            color: ${colors.fg};
            outline: none;
            height: 30px;
            width: 0;
            overflow: hidden;
            font-weight: 100;
            transform: scale(0);
            transform-origin: 0 50%;
            transition: 275ms ease;
            padding: 0 0 10px 16px;
          `}
        />
        <i
          onMouseDown={e => {
            setFocused(!focused)
            e.stopPropagation()
          }}
          css={css`
            position: absolute;
            color: white;
            font-size: 18px;
            top: 50%;
            right: 13px;
            transform: translateY(-50%);

            &:before {
              position: relative;
              top: ${focused ? '2px' : '1px'};
              left: ${focused ? '8px' : '5px'};
              content: url(${mainIcon(focused)});
            }
          `}
        ></i>
      </Box>
    )
  },
)
