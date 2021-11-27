// @ts-nocheck
/** @jsx jsx */
import { jsx } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { Flex } from '@rebass/emotion'

/**
 * Base list item (used by `AutopilotListItem`, `DatacenterListItem` and `LocationListItem`)
 * for managing common styles and behaviour.
 */
export default function BaseListItem({
  children,
  hasCursor = false,
  elementRef = null,
  onClick,
  css,
  ...rest
}) {
  const theme = useTheme(ThemeContext)

  return (
    <div
      ref={elementRef}
      css={{
        height: '48px',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        borderBottom: `2px solid ${theme.colors.divider}`,
        color: hasCursor ? theme.colors.fg : theme.colors.fgLight,
        cursor: 'pointer',
        ':hover': {
          color: theme.colors.fg,
        },
        transition: `color 150ms, border-bottom 200ms`,
        position: 'relative',
        ...css,
      }}
      onClick={onClick}
      {...rest}
    >
      <Flex
        css={{
          flexDirection: 'row',
          width: '100%',
        }}
      >
        {/* the border is supposed to itself have an 8px margin, which is very unnatural to do
        in CSS so we use an absolutely positioned strip of background colour to create an artificial 
        border margin */}
        <div
          css={{
            position: 'absolute',
            bottom: '-2px',
            width: '8px',
            height: '2px',
            left: '0px',
            backgroundColor: theme.colors.bg,
          }}
        />
        <div css={{ flex: '1', whiteSpace: 'nowrap' }}>{children}</div>
      </Flex>
    </div>
  )
}
