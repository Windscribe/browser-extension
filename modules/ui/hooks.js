import { useEffect, useState, useContext, useRef } from 'react'
import { ThemeContext } from '@emotion/core'
import { useSelector, useDispatch } from 'react-redux'
/**
 * Gets client rect of a React ref.
 * @param {React.RefObject} ref A react ref.
 * @returns {Object} Returns the bounding client rect of the element.
 */
export let useClientRect = ref => {
  let [rect, setRect] = useState({})
  useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect())
    }
  }, [ref])

  return rect
}

/**
 * @param {Function} mapper Maps state to object (mapStateToProps)
 * @param {*} inputs
 * @returns Mapped state
 */
export let useConnect = useSelector

export const useTheme = (c = ThemeContext) => useContext(c)

export const usePrevious = value => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export { useDispatch }
