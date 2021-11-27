import React, { useState } from 'react'
import { SettingItem } from 'components/Settings'

//setting changes slow down the toggle animations, this solves it by performing action after change
export default ({
  toggleState,
  toggleEvent = () => {},
  title = '',
  subHeading = '',
  postToggleEvent = () => {},
  ...props
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [checked, setToggleChecked] = useState(toggleState)

  return (
    <SettingItem
      title={title}
      subHeading={subHeading}
      checked={checked}
      onTransitionEnd={e => {
        e.stopPropagation()
        e.persist()
        //For the toggle thumb transition [only relevant prop affected in this component]
        if (e.propertyName === 'left') {
          toggleEvent()
          postToggleEvent()
        }
        setIsTransitioning(false)
      }}
      //anticipatory change
      onChange={() => {
        if (!isTransitioning) {
          setIsTransitioning(true)
          setToggleChecked(!checked)
        }
      }}
      {...props}
    />
  )
}
