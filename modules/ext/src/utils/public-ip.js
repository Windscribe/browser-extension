export default async () => {
  const response = await fetch('https://checkipv4.windscribe.com').then(r =>
    r.text(),
  )
  return response.trim()
}
