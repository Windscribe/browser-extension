import styled from '@emotion/styled'
import { keyframes } from '@emotion/core'
import { Flex, Box } from '@rebass/emotion'
import { InlineButton } from 'ui/Button'
import splitIconLightBase64 from './splitIconLightBase64'
import splitIconDarkBase64 from './splitIconDarkBase64'
import proxyTimeIconBase64 from './proxyTimeIconBase64'

export const SettingItemContainer = styled(Box)`
  margin-bottom: ${({ theme }) => theme.space[1]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.divider};
`

export const RotateContainer = styled(Box)`
  margin-right: ${({ theme }) => theme.space[1]};
  padding-right: ${({ theme }) => theme.space[1]};
`

export const CookieMonsterSelectContainer = styled(Flex)`
  flex-direction: column;
  display: ${({ visible = false }) => !visible && 'none'};
  padding-left: ${({ theme }) => theme.space[3]};

  & > * {
    padding: ${({ theme }) => theme.space[2]} 0;
    border-bottom: 2px solid ${({ theme }) => theme.colors.divider};
    &:first-of-type {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
      margin-bottom: -4px;
      border: none;
    }
  }
`

export const CookieMonsterButton = styled(InlineButton)`
  display: flex;
  justify-content: space-between;
  position: relative;
  color: ${({ active = false, theme }) =>
    active ? theme.colors.primary : theme.colors.fg};
  width: 100%;
`

export const playSplit = keyframes`
  0%{
    background-position: 0px 0px;
  }

  100% {
    background-position: -1456px 0px;
  }

`

export const SplitIconStyled = styled.div`
  background-image: url(${({ isDark }) =>
    isDark ? splitIconDarkBase64 : splitIconLightBase64});
  animation-duration: ${({ durationMs }) => durationMs + 'ms'};
  animation-timing-function: steps(91);
  animation-fill-mode: forwards;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  cursor: pointer;
`

export const ProxyTimeIconStyled = styled.div`
  fill: red;
  background-image: url(${proxyTimeIconBase64});
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
`
