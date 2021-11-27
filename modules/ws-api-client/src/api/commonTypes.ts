import { PrepLoginForm } from './prepLoginForm'
import { SetConfig, GetConfig } from './config'

export enum BooleanNumber {
  FALSE = 0,
  TRUE = 1,
}

export enum SessionType {
  WEBSITE = 1,
  EXTENSION = 2,
  DESKTOP = 3,
  MOBILE = 4,
}

export interface ApiException {
  code: number
  message: string
  data: Record<string, unknown> | string
  debug?: Record<string, unknown>
}

export interface Action {
  type: string
  [key: string]: unknown
}

export type ActionCreator = (data?: unknown) => Action

export type Dispatch = (action: Action) => void

export interface ActionCreators {
  successfulReduxAction?: ActionCreator
  failedReduxAction?: ActionCreator
  loadingReduxAction?: ActionCreator
}

export type EndpointApi<
  T extends ActionCreators = ActionCreators,
  U = Record<string, unknown>
> = (endPointInput: T) => Promise<U> | U

export interface RequestArgs {
  method: string
  endpoint: string
  opts?: Options
  debugOpts?: Record<string, unknown>
  actionCreators: ActionCreators
  assets?: boolean
}
interface Options {
  params?: Record<string, unknown>
  method?: string
  headers?: Record<string, unknown>
  body?: string
}
export interface ApiArgs {
  endpoint: string
  params: Record<string, unknown>
  actionCreators: ActionCreators
}
export interface DispatcherArgs {
  dispatch?: Dispatch
  actionCreator: ActionCreator
  data: unknown
  getConfig?: GetConfig
}
export type ApiCall<T = Record<string, unknown>> = (p: ApiArgs) => Promise<T>
export type ApiRequest<T = Record<string, unknown>> = (
  p: RequestArgs,
) => Promise<T>
export interface ApiInterface<T = Record<string, unknown>> {
  prepLoginForm: PrepLoginForm
  request: ApiRequest<ApiResponse<T>>
  get: ApiCall<ApiResponse<T>>
  delete: ApiCall<ApiResponse<T>>
  put: ApiCall<ApiResponse<T>>
  post: ApiCall<ApiResponse<T>>
  dispatcher: (p: DispatcherArgs) => void
  sendRequest: ApiRequest<ApiResponse<T>>
  setConfig: SetConfig
  getConfig: GetConfig
}

export interface MetaData {
  serviceRequestId?: string
  hostName?: string
  duration?: string
  logStatus?: string
  md5?: string
}

export interface Info {
  revison: string
  revision_hash: string
  changed: BooleanNumber
}

export interface ApiResponse<T = Record<string, unknown>> {
  data: T
  info?: Info
  metadata: MetaData
}
