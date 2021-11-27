import styled from '@emotion/styled'
import { Button as _Button } from '@rebass/emotion'
import {
  InlineButtonStyle,
  IconButtonStyle,
  SimpleButtonStyle,
  ButtonStyle,
} from './styles'

/* Components */
export const InlineButton = styled.button`
  ${InlineButtonStyle};
`
InlineButton.displayName = 'InlineButton'

export const IconButton = styled.button`
  ${IconButtonStyle};
`
IconButton.displayName = 'IconButton'

const Button = styled.button`
  ${ButtonStyle};
`
Button.displayName = 'Button'

export const SimpleButton = styled.button`
  ${SimpleButtonStyle};
`

export default Button
