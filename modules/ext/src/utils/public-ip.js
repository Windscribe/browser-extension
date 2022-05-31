export default async () => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), 3000)

  const response = await fetch('https://checkipv4.windscribe.com', {
    signal: controller.signal,
  })
    .then(r => r.text())
    .catch(() => '---.---.---.---')
  return response
}
