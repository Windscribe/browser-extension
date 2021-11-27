import md5 from 'md5'

type ClientAuthHash = (
  ts?: string | number,
  secret?: string,
) => string | number[]

const clientAuthHash: ClientAuthHash = (
  ts,
  secret = (typeof window === 'object'
    ? window.CLIENT_AUTH_SECRET
    : global.CLIENT_AUTH_SECRET) ||
    process.env.REACT_APP_CLIENT_AUTH_SECRET ||
    process.env.WEB_EXT_CLIENT_AUTH_SECRET ||
    process.env.CLIENT_AUTH_SECRET ||
    '952b4412f002315aa50751032fcaab03',
) => md5(`${secret}${ts}`)

const getMandatoryParams = (
  sessionAuthHash?: string,
): Record<string, string> => {
  const time = Math.round(new Date().getTime() / 1000).toString()
  return {
    client_auth_hash: clientAuthHash(time).toString(),
    session_auth_hash: sessionAuthHash,
    time,
  }
}

export default getMandatoryParams
