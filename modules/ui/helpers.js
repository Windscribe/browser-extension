import Color from 'color'

const pxBase = 16
const gridBase = 8

/**
 * @description Converts a pixel value to a rem
 * @param {Number} px A PX value as a number
 * @returns {String} a rem value
 */
export const rem = px => `${px / pxBase}rem`

export const opacity = (color, range) =>
  Color(color)
    .alpha(range)
    .rgb()
    .string()

export const darken = (color, range) =>
  Color(color)
    .darken(range)
    .rgb()
    .string()

export const lighten = (color, range) =>
  Color(color)
    .lighten(range)
    .rgb()
    .string()

export const mix = (base, mix, range) =>
  Color(base)
    .mix(Color(mix), range)
    .rgb()
    .string()

/**
 * @description Construct an array of numbers based on a grid value
 * @returns {Array} array should contain rem values from 0 to the max layout value
 * @param {Array} grid An array of layout grid values
 * @param {Number} index current index of the loop
 * @param {Number} base Base number of the grid
 * @param {Number} limit Limit of how many entries in the array
 */
export const constructGrid = (
  grid = [],
  index = 0,
  base = gridBase,
  limit = gridBase + 1,
) => {
  const keyLength = grid.length

  if (keyLength === limit) {
    return grid
  }

  const newGrid = [...grid, rem(index * base)]
  return constructGrid(newGrid, index + 1)
}
