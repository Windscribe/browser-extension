import React from 'react'
import { createStory } from 'ui/.storybook/helpers'

import Input from '.'

export default createStory('Input', [
  ['Default', () => <Input label="My Input" />],
])
