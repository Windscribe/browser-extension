import React from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import Button from 'ui/Button'
import { opacity } from 'ui/helpers'
import posed from 'react-pose'
import theme from '../themes/ext.theme'

const animationSettings = {
  transition: {
    ease: 'easeIn',
    duration: 30,
    type: 'spring',
    stiffness: 190,
    damping: 20,
  },
}

const AlertAnimationContainer = posed.div({
  showing: {
    applyAtStart: { display: 'block' },
    opacity: 1,
    y: ({ isReversed }) => (isReversed ? '0%' : '100%'),
    ...animationSettings,
  },
  notShowing: {
    applyAtEnd: { display: 'none' },
    opacity: 0,
    y: ({ isReversed }) => (isReversed ? '100%' : '0%'),
    ...animationSettings,
  },
})

const AlertBadge = styled.div`
  z-index: 9999;
  background: ${theme.colors.orange};
  box-shadow: 0 2px 5px 0 ${opacity(theme.colors.black, 0.27)};
`

const Alert = ({
  content,
  showing,
  isReversed = false,
  topOffset = '0px',
  leftOffset = '25%',
  onClick = () => {},
  domNode, //this alert should typically be rendered at top level container
  position = 'fixed',
  badgeStyledAs = Button,
  customBadgeStyle,
}) => {
  return ReactDOM.createPortal(
    <AlertAnimationContainer
      css={css`
        position: ${position};
        left: ${leftOffset};
        top: ${topOffset};
        z-index: 999;
      `}
      pose={showing ? 'showing' : 'notShowing'}
      isReversed={isReversed}
      tabIndex={-1}
    >
      <AlertBadge
        tabIndex={0}
        as={badgeStyledAs}
        css={customBadgeStyle}
        onClick={onClick}
        primary
        aria-live="polite"
      >
        {content}
      </AlertBadge>
    </AlertAnimationContainer>,
    domNode,
  )
}

export default Alert
