import { actions } from 'state'
import pushToDebugLog from 'utils/debugLogger'
import api from 'api'
import pickHosts from 'utils/pickHosts'

export default async ({ serverList, dispatch, premium, activity }) => {
  try {
    pushToDebugLog({
      activity,
      message: 'Fetching best location',
    })
    const { data } = await api.get({ endpoint: '/BestLocation' })
    const location = serverList.data?.find(x => x.name === data.location_name)
    //If still no datacenter, fail
    if (typeof location === 'undefined') {
      throw Error('Location not found in serverlist')
    }
    let dataCenter = location.groups?.find(x => x.id === data.dc_id)
    //This shouldnt happen in production, but good to cover it anyway
    //If the bestlocation is not in the serverlist, go up to the location
    if (typeof dataCenter === 'undefined') {
      dataCenter = location.groups?.find(x => x.pro <= premium)
    }
    //If still no datacenter, fail
    if (typeof dataCenter === 'undefined') {
      throw Error('No dcs available in location')
    }
    pushToDebugLog({
      activity,
      message: `Successfully fetched best location. Datacenter is: ${JSON.stringify(
        dataCenter,
        null,
        4,
      )}`,
    })
    dispatch(
      actions.bestLocation.fetchSuccess({
        ...dataCenter,
        hosts: pickHosts(dataCenter.hosts),
        locationId: location.id,
      }),
    )
    return data
  } catch (e) {
    console.error(e)
    dispatch(actions.bestLocation.fetchFailure(e))
    pushToDebugLog({
      activity,
      level: 'ERROR',
      message: `Error while fetching best location: ${JSON.stringify(e)}`,
    })
    return e
  }
}
