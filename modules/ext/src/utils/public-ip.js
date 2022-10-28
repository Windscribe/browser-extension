import api from 'api'

export default async () => {
  const { workingApi } = api.getConfig()
  if (workingApi) {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 3000)

    return await fetch(`https://checkip${workingApi}`, {
      signal: controller.signal,
    })
      .then(r => r.text())
      .catch(() => '---.---.---.---')
  }
  return '---.---.---.---'
}
