import React, { memo, useEffect } from 'react'
import { InlineButton } from 'ui/Button'
import { css } from '@emotion/core'
import { useDispatch, useConnect } from 'ui/hooks'
import { useTranslation } from 'react-i18next'
import { WithToolTip } from 'components/Utils'
import { actions } from 'state'
import GlobeIcon from 'assets/globe.svg'
import GlobeArrow from 'assets/globe_arrow.svg'
import { Box } from '@rebass/emotion'

export default memo(({ isHovering, setIsHovering }) => {
  const showOnboarding = useConnect(s => s.showOnboarding)
  const { t } = useTranslation()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleKeyboardPress = e => {
      switch (e.keyCode) {
        //space, open locations
        case 32:
          dispatch(actions.view.set('Locations'))
          break
        default:
      }
    }
    window.addEventListener('keyup', handleKeyboardPress)
    return () => {
      window.removeEventListener('keyup', handleKeyboardPress)
    }
  }, [dispatch])

  return (
    <WithToolTip tip={t('Locations Menu')} placement="top-end">
      <InlineButton
        tabIndex={0}
        aria-label={t('Locations')}
        onClick={() => dispatch(actions.view.set('Locations'))}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        active={showOnboarding || isHovering}
      >
        <Box pr={4}>
          <Box
            css={css`
              position: relative;
              transition: 0.25s;
              left: ${isHovering ? '18px' : '30px'};
            `}
            className="joyride-element-change-location"
          >
            <GlobeIcon />
          </Box>
          <Box
            ml={3}
            css={css`
              position: relative;
              top: -27px;
              visibility: ${isHovering ? 'initial' : 'hidden'};
              left: 30px;
            `}
          >
            <GlobeArrow />
          </Box>
        </Box>
      </InlineButton>
    </WithToolTip>
  )
})
