import api from 'api'
import { IS_CHROME } from 'utils/constants'

export default ({ is_premium, loc_hash, alc }) => {
  let conf = {
    type: IS_CHROME ? 'chrome' : 'firefox',
    premium: is_premium,
    revision: loc_hash,
  }

  if (alc) {
    conf = { ...conf, alc }
  }

  return api.serverList.get(conf)
}
