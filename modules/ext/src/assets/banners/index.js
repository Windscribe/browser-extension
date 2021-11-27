import sample from 'lodash/sample'
import theme from 'ui/themes/ext.theme'

import barbed from './barbed_bg.png'
import invader from './invader_bg.png'
import psy from './psy_bg.png'
import scope from './scope_bg.png'

const allBanners = [
  { img: barbed, bgColor: theme.colors.red },
  { img: invader, bgColor: theme.colors.orange },
  { img: psy, bgColor: theme.colors.purple },
  { img: scope, bgColor: theme.colors.primary },
]

export const randomBanner = () => {
  return sample(allBanners)
}

export default allBanners
