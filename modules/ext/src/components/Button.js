import React from 'react'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'
import styled from '@emotion/styled'
import Button, { IconButton, InlineButton } from 'ui/Button'

/* Components */
export const WebLink = p => <InlineButton {...p} />

export const WebLinkButton = p => <Button {...p} />

const useConnector = type => {
  const dispatch = useDispatch()
  return payload => dispatch(actions[type].set(payload))
}

export const ModalButton = ({ component, ...props }) => {
  const set = useConnector('modal')
  return <Button {...props} onClick={() => set({ component })} />
}

export const LinkButton = ({ to, ...props }) => {
  const set = useConnector('view')
  return <Button {...props} onClick={() => set(to)} />
}

export const ModalInlineButton = ({ component, ...props }) => {
  const set = useConnector('modal')
  return <InlineButton {...props} onClick={() => set({ component })} />
}

export const Link = ({ to, ...props }) => {
  const set = useConnector('view')
  return <InlineButton {...props} onClick={() => set(to)} />
}

export const LinkIconButton = p => <IconButton {...p} />

export const ActionButton = styled(WebLinkButton)`
  background-color: ${({ background }) => background} !important;
  border-color: ${({ background }) => background} !important;
  margin-bottom: ${({ theme }) => theme.space[1]};
  width: 166px;

  &:hover {
    color: black !important;
    background-color: white !important;
    border-color: white !important;
  }
`
