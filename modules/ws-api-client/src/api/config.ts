import { Dispatch, SessionType } from './commonTypes'

export interface Config {
  workingApi?: string | null
  apiUrl?: string
  assetsUrl?: string
  backupApiUrl?: string
  backupAssetsUrl?: string
  sessionAuthHash?: string
  sessionType?: SessionType
  dispatch?: Dispatch
  platform?: string
  lastCallTimeStamps?: { [key: string]: number }
  apiCallMinInterval?: string
}

export let globalConfig: Config = {
  workingApi: null,
  apiUrl: process.env.API_URL,
  assetsUrl: process.env.ASSETS_URL,
  backupApiUrl: process.env.BACKUP_API_URL,
  backupAssetsUrl: process.env.BACKUP_ASSETS_URL,
  sessionAuthHash: null,
  sessionType: null,
  dispatch: null,
  platform: null,
  apiCallMinInterval: process.env.API_CALL_MIN_INTERVAL || '1000',
}

export type SetConfig = (t: Config) => void
export const setConfig: SetConfig = nextConfig => {
  globalConfig = {
    ...globalConfig,
    ...nextConfig,
  }
}

export type GetConfig = () => Config
export const getConfig: GetConfig = () => globalConfig

type DebugConfig = () => void
export const debugConfig: DebugConfig = () => {
  /* eslint-disable no-console */
  console.log('Debug Config')
  console.log(getConfig())
}
