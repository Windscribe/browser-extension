import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import { Popup } from '../src/popup'

storiesOf('Welcome', module).add('to Storybook', () => <Popup />)
