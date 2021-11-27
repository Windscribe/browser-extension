import _create from './createInstance'

// -- ADMIN ENDPOINT IMPORTS HERE --
import AdminUsers from './admin/AdminUsers/'
import AdminSession from './admin/AdminSession/'
import { Config } from './api/config'

// i.e. import AdminBilling from './admin/AdminBilling/'

const endpoints = {
  users: AdminUsers,
  session: AdminSession,
}

export function create(conf: Config = {}): Record<string, unknown> {
  return _create({ conf, endpoints })
}
