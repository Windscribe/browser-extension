import { createStory } from 'ui/.storybook/helpers'
import { boolean } from '@storybook/addon-knobs'
import React from 'react'

import Alert from '.'

const domNode = document.createElement('div')
document.body.appendChild(domNode)
export default createStory('Alert', [
  [
    'Alert',
    props => (
      <div>
        <Alert
          content={<div>Testing</div>}
          domNode={domNode}
          showing={props.showing}
          topOffset="50px"
        />
      </div>
    ),
    {
      knobs: {
        showing: [boolean, false],
      },
    },
  ],
])
