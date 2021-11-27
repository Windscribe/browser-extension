import React from 'react'
import { boolean } from '@storybook/addon-knobs'
import { createStory } from 'ui/.storybook/helpers'
import Button from '.'

export default createStory('Button', [
  [
    'Default',
    props => <Button lg={props.lg}>Eyyyy</Button>,
    {
      docs: require('./docs.md'),
      knobs: {
        lg: [boolean, false],
      },
    },
  ],
])
