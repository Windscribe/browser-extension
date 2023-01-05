import api from 'api'

export default async () => {
  const noIp = '---.---.---.---'
  const { workingApi } = api.getConfig()

  if (workingApi) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(`https://checkip${workingApi}`, {
      signal: controller.signal,
    })
      .then(r => r.text())
      .catch(() => noIp)

    clearTimeout(timeoutId)

    return res
  }
  return noIp
}
