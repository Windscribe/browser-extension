import React from 'react'
import { Flex } from '@rebass/emotion'
import { actions } from 'state'
import ConnectingRing from 'assets/connecting-ring.svg'
import ConnectedRing from 'assets/connected-ring.svg'
import ConnectionFailureRing from 'assets/onproxyfailure-ring.svg'
import { ButtonContainer, ConnectBar, ConnectButton, SpinAnim } from './styles'
import { ACCOUNT_STATES } from 'utils/constants'
import pushToDebugLog from 'utils/debugLogger'
import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from 'reselect'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const ACTIVITY = 'proxy_bar'

const selector = createSelector(
  s => s.proxy.status,
  s => s.session.status,
  s => s.session.username,
  s => s.online,
  (...args) => args,
)

export default () => {
  const [proxyStatus, sessionStatus, username, online] = useSelector(selector)
  const { colors } = useTheme(ThemeContext)

  const dispatch = useDispatch()
  const activate = () =>
    dispatch(actions.proxy.activate({ logActivity: ACTIVITY }))
  const deactivate = () =>
    dispatch(actions.proxy.deactivate({ logActivity: ACTIVITY }))
  const goToExpired = () =>
    dispatch(actions.view.set(username ? 'NoData' : 'GhostNoData'))

  return (
    <Flex
      ml={3}
      css={{
        transform: 'translate(0px, -7px)',
        transition: '0.3s',
        ':hover': {
          transform: 'scale(1.1) translate(0px, -7px)',
        },
      }}
    >
      <ButtonContainer
        status={proxyStatus}
        tabIndex={0}
        aria-label={`proxy-toggle`}
        onClick={() => {
          if (sessionStatus === ACCOUNT_STATES.ACTIVE) {
            if (proxyStatus === 'disconnected') {
              activate()
            } else {
              deactivate()
            }
          } else {
            // you must be expired to reach this state, banned users have no access at all to ui
            goToExpired()
          }
          pushToDebugLog({
            tag: 'popup',
            activity: ACTIVITY,
            message: `User clicked proxy button`,
          })
        }}
      >
        <ConnectButton
          aria-hidden={true}
          tabIndex={-1}
          className="joyride-element-proxy-button"
          height={70}
          width={70}
          fill="white"
        />
      </ButtonContainer>
      {proxyStatus === 'connecting' && (
        <ConnectBar>
          <ConnectingRing
            css={{
              animation: `${SpinAnim} 1s linear infinite`,
            }}
          />
        </ConnectBar>
      )}
      {proxyStatus === 'connected' && (
        <ConnectBar>
          <ConnectedRing fill={online ? colors.green : colors.yellow} />
        </ConnectBar>
      )}
      {proxyStatus === 'error' && (
        <ConnectBar>
          <ConnectionFailureRing fill={online ? colors.green : colors.yellow} />
        </ConnectBar>
      )}
    </Flex>
  )
}
