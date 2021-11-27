// import api from '../../dist/index'

export default async (api, sessionType = 2, isPro = true) => {
  const data = await api.session.login({
    username: process.env[isPro ? 'WS_USER_PRO' : 'WS_USER_FREE'],
    password: process.env.WS_USER_PASS,
    sessionType,
  })
  api.setConfig({ sessionAuthHash: data.session_auth_hash, sessionType })
  return data.loc_hash
}
