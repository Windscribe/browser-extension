import api from 'api'

export default async () => {
  let response
  try {
    const { data } = await api.get({ endpoint: '/MyIp' })
    response = data
  } catch (e) {
    response = e
  }
  return response
}
