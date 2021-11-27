import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withDocs } from 'storybook-readme'

let construct = (Component, { knobs = {}, ...p }) => props => {
  let activeKnobs = Object.entries(knobs).reduce((obj, [k, v]) => {
    let [fn, defaultVal] = v

    obj[k] = fn(k, defaultVal)

    return obj
  }, {})
  return <Component {...props} {...p} {...activeKnobs} />
}

export const createStory = (storyName, stories = []) => {
  let story = storiesOf(storyName, module)

  stories.forEach(([name, Story, { docs = null, ...rest } = {}]) => {
    if (docs) {
      story.add(name, withDocs(docs, construct(Story, rest)))
    } else {
      story.add(name, construct(Story, rest))
    }
  })
}
