import createInstance from './createInstance'

// -- ENDPOINT IMPORTS HERE --
import Notifications from './Notifications'
import Session from './Session'
import ServerCredentials from './ServerCredentials'
import ServerList from './ServerList'
import Users from './Users'
import RecordInstall from './RecordInstall'
import RegToken from './RegToken'
import { Config } from './api/config'

global.url = ''

const endpoints = {
  notifications: Notifications,
  session: Session,
  serverCredentials: ServerCredentials,
  serverList: ServerList,
  users: Users,
  recordInstall: RecordInstall,
  regToken: RegToken,
}

export function create(conf: Config = {}): Record<string, unknown> {
  return createInstance({ conf, endpoints })
}
