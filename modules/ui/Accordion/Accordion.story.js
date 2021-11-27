import React, { lazy } from 'react'
import { createStory } from 'ui/.storybook/helpers'

import Accordion from '.'
export default createStory('Accordion', [['Accordion', props => (
    <div>
      <Accordion
       items={[]}
       Title={()=><div>Title</div>}
       Body={()=><div>Body</div>}
       collapseAll={false}
      />
    </div>
  )]])
