import React from 'react'
import { createStory } from 'ui/.storybook/helpers'

import Tooltip from '.'

export default createStory('Tooltip', [
  [
    'Default',
    () => (
      <Tooltip message={'Hello there'}>
        <h1>Hello</h1>
      </Tooltip>
    ),
  ],
])
