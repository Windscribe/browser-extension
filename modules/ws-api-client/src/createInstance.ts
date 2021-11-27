import * as api from './api'
import * as codes from './codes'
import { globalConfig, Config } from './api/config'

const createEndpointMap = ({ api, endpoints = {} }) =>
  Object.entries(endpoints).reduce((obj, [k, v]) => {
    if (typeof v === 'function') {
      obj[k] = v(api)
    }
    return obj
  }, {})

export default ({
  conf = {},
  endpoints = {},
}: {
  conf: Config
  endpoints: Record<string, unknown>
}): Record<string, unknown> => {
  const config = { ...globalConfig, ...conf }
  api.setConfig(config)
  const instance = {
    ...api,
    codes,
    ...createEndpointMap({ api, endpoints }),
  }

  return instance
}
