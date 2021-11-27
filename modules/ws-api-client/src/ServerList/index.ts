import urlJoin from 'url-join'
import {
  ApiInterface,
  EndpointApi,
  ActionCreators,
  ApiResponse,
  BooleanNumber,
} from '../api/commonTypes'

enum ServerStatus {
  OFFLINE = 1,
  ONLINE = 2,
}
interface ServerInfo {
  id: number
  name: string // Country name
  country_code: string // ISO 3166-1 alpha-2 country code
  status: ServerStatus // 1 - Location is online. 2 - Location is temporarily offline.
  premium_only: BooleanNumber // free or premium
  short_name: string // same as country code except for US and Canada locations, which are subdivided by coast.
  p2p: BooleanNumber // p2p allowed or not
  tz_offset: string
}

interface DesktopInfo extends ServerInfo {
  nodes: Node[]
}

interface Node {
  ip: string // nodes.hostname ip
  ip2: string // for OpenVPN conections
  ip3: string // for Stunnect connections
  hostname: string // for IKEv2
  weight: number // relatve node weight
  group: string //data center in which the server is
}
interface ExtensionInfo extends ServerInfo {
  groups: {
    // key is Data-center/City name
    [key: string]: {
      pro: BooleanNumber // free or premium
      hosts: [
        {
          hostname: string // hostname used in PAC file
          weight: number // relative weight for load balancing
        },
      ]
    }
  }
}

type ServerData = DesktopInfo[] | ExtensionInfo[]

interface GetParams extends ActionCreators {
  type: string
  premium: BooleanNumber
  revision: string
  alc?: []
}
export default (
  api: ApiInterface<ServerData>,
): { get: EndpointApi<GetParams, ApiResponse<ServerData>> } => ({
  /**
   * GET /ServerList
   * @param {String} type Type of server list to get: [desktop, extension, mobile, ikev2, openvpn]
   * @param {Number} premium Pro list or Free list
   * @param {String} revision Revision hash
   * @param {Function} successfulReduxAction Optional, A redux action creator on successful request
   * @param {Function} failedReduxAction Optional, A redux action creator on failed request
   * @param {Function} loadingReduxAction Optional, A redux action creator on request start
   */
  async get({
    type,
    premium,
    revision,
    alc = null,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const conf = {
      method: 'get',
      endpoint: urlJoin('serverlist', type, premium.toString(), revision),
      opts: {
        params: alc ? { alc: alc.join(',') } : {},
      },
      actionCreators: { failedReduxAction, loadingReduxAction },
      assets: true,
    }

    const data = await api.request(conf)
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: data,
        getConfig: api.getConfig,
      })
    }
    return data
  },
})
