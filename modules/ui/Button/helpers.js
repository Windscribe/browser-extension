import { spacing, type } from 'styles/theme'
import { darken } from 'styles/helpers'

export const getSize = (lg = false) => ({
  fontSize: lg ? type.sizes[1] : type.sizes[0],
  height: lg ? spacing[5] : spacing[3],
  padding: lg ? `0 ${spacing[3]}` : `0 ${spacing[2]}`,
})

export const getOpacity = (active = false) => ({
  opacity: active ? 1 : 0.4,
  '&:hover': {
    opacity: 1,
  },
  '&:active': {
    opacity: 1,
  },
})

export const getColor = color => ({
  color,
  '&:hover': {
    color: darken(color, 0.2),
  },
  '&:active': {
    color: darken(color, 0.4),
  },
})
