import getMandatoryParams from './getMandatoryParams'
import { SessionType } from './commonTypes'

interface User {
  username: string
  password: string
  sessionType: SessionType
  twoFACode?: string
}

export type PrepLoginForm = (t: User) => { body: string; protectedBody: string }

export const prepLoginForm: PrepLoginForm = ({
  username,
  password,
  sessionType,
  twoFACode,
}) => {
  const { time, client_auth_hash } = getMandatoryParams()
  const params = {
    username,
    password,
    time,
    client_auth_hash,
    session_type_id: sessionType,
  }
  if (twoFACode) {
    params['2fa_code'] = twoFACode
  }

  const genQueryString = (_params: Record<string, unknown>) =>
    Object.entries(_params)
      .map(
        ([key, val]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(val as string)}`,
      )
      .join('&')

  // TODO: use query-string
  return {
    body: genQueryString(params),
    protectedBody: genQueryString({
      ...params,
      password: password && password.length > 0 ? 'xxxx' : 'no_set',
    }),
  }
}

// export default prepLoginForm
