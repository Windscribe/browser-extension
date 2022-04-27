import React, { useContext } from 'react'
import styled from '@emotion/styled'
import posed from 'react-pose'
import { Flex } from '@rebass/emotion'
import MenuHeader from './WhitelistTrayHeader'
import MenuBody from './WhitelistTrayBody'
import AltTheme from './AltTheme'

import { Context } from './state'

const animationSettings = {
  transition: {
    ease: 'easeOut',
    duration: 25,
    type: 'spring',
    stiffness: 200,
    damping: 20,
  },
}

const AnimationContainer = posed.div({
  open: {
    y: '0%',
    ...animationSettings,
  },
  closed: {
    y: '100%',
    ...animationSettings,
  },
})

const MenuOverlay = styled(Flex)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: flex-end;

  background: ${({ theme }) => theme.colors.black};

  color: ${({ theme }) => theme.colors.fg};

  z-index: 2;

  ${({ style: { isOpen = false } = {} }) =>
    isOpen
      ? {
          transition: 'opacity ease 0.2s',
          opacity: 1,
        }
      : {
          transition: 'opacity ease 0.5s',
          opacity: 0,
          pointerEvents: 'none',
        }};
`
//this overflow hides the bg when the tray 'bounces'
const MenuOverflow = styled(Flex)`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.fg};
  height: 20px;
  width: 100%;
  z-index: -99;
`

export default () => {
  const WhitelistContext = useContext(Context)
  const { menuOpen } = WhitelistContext.state.uiState
  const trayTabIndex = menuOpen ? 0 : -1

  return (
    <MenuOverlay style={{ isOpen: menuOpen, tabIndex: trayTabIndex }}>
      <AnimationContainer pose={menuOpen ? 'open' : 'closed'}>
        <Flex role="dialog" aria-modal={true} flexDirection="column">
          <AltTheme invertCurrentTheme>
            <MenuHeader trayTabIndex={trayTabIndex} />
          </AltTheme>
          <MenuBody trayTabIndex={trayTabIndex} />
        </Flex>
      </AnimationContainer>
      <MenuOverflow />
    </MenuOverlay>
  )
}
