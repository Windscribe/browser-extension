/* global browser */
import { isEmpty } from 'lodash'
import {
  ENVS,
  SESSION_POLLER_INTERVAL,
  GLOBAL_ERROR_LOG,
  API_CALL_MIN_INTERVAL,
} from './constants'

const ENV = process.env.WEB_EXT_ENV || 'PROD'
const suffixes = [
  'ENV',
  'API_URL',
  'ASSETS_URL',
  'BACKUP_API_URL',
  'BACKUP_ASSETS_URL',
  'ROOT_URL',
  'SESSION_POLLER_INTERVAL',
  'GLOBAL_ERROR_LOG',
  'API_CALL_MIN_INTERVAL',
]
const envs = [
  ENV,
  process.env.WEB_EXT_API_URL || ENVS[ENV].API_URL,
  process.env.WEB_EXT_ASSETS_URL || ENVS[ENV].ASSETS_URL,
  process.env.WEB_EXT_BACKUP_API_URL || ENVS[ENV].BACKUP_API_URL,
  process.env.WEB_EXT_BACKUP_ASSETS_URL || ENVS[ENV].BACKUP_ASSETS_URL,
  process.env.WEB_EXT_ROOT_URL || ENVS[ENV].ROOT_URL,
  +process.env.WEB_EXT_SESSION_POLLER_INTERVAL || SESSION_POLLER_INTERVAL, // 10 minute
  +process.env.WEB_EXT_GLOBAL_ERROR_LOG || GLOBAL_ERROR_LOG, // 1 minute
  +process.env.WEB_EXT_API_CALL_MIN_INTERVAL || API_CALL_MIN_INTERVAL, // 1 minute
]

const globals = suffixes.reduce(
  (acc, key) => ({
    ...acc,
    [key]: browser.storage.local
      .get(key)
      .then(val =>
        isEmpty(val) ? envs[suffixes.indexOf(key)] : Object.values(val).pop(),
      ),
  }),
  {},
)

window.globals = globals
export default globals
