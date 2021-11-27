import { random, add, subtract } from 'lodash'
import { compose } from 'redux'

const randomAddOrSubtract = (...params) =>
  random(0, 1) ? add(...params) : subtract(...params)

const formatCoord = compose(
  x => parseFloat(x.toFixed(4)),
  /* We need to add noise to the gps coords as a way to make the spoofed location like a little more 'natural' */
  c => randomAddOrSubtract(c, random(0, 0.06 /* 6KM */, true)),
  parseFloat,
)

export const getFuzzyCoords = gps => {
  const [latitude, longitude] = gps.split(',').map(formatCoord)
  return {
    latitude,
    longitude,
    accuracy: random(35, 100),
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  }
}
