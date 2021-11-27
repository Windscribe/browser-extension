import { prepLoginForm } from './prepLoginForm'

import { default as sendRequest } from './sendRequest'

import { get, post, put, del, request } from './http'

import dispatcher from './dispatcher'

import { setConfig, getConfig } from './config'

export {
  prepLoginForm,
  request,
  get,
  del as delete,
  put,
  post,
  dispatcher,
  sendRequest,
  setConfig,
  getConfig,
}
