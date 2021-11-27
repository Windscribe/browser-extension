import {
  ApiInterface,
  EndpointApi,
  ActionCreators,
  BooleanNumber,
  SessionType,
} from '../api/commonTypes'
import getMandatoryParams from '../api/getMandatoryParams'

const endpoint = '/Users'

type UserData = UserInfo | VoucherStatus | EmailStatus | PasswordStatus

interface UserInfo {
  user_id: string
  secure_links_secret: string
  session_auth_hash: string
  username: string
  traffic_used: number
  traffic_max: number
  status: BooleanNumber
  email: string | null
  email_status: BooleanNumber
  billing_plan_id: number
  is_premium: BooleanNumber
  reg_date: number
  last_reset: number
  loc_rev: number
  loc_hash: string
}
interface EmailStatus {
  email: string | null
}

interface PasswordStatus {
  password_updated: BooleanNumber
}
interface VoucherStatus {
  voucher_claimed: boolean
  voucher_used: boolean
  voucher_taken: boolean
}

interface CreateAccountParams extends ActionCreators {
  username: string
  password: string
  sessionType: SessionType
  params?: Record<string, unknown>
}

interface GhostAccountParams extends ActionCreators {
  token: string
  sessionType: SessionType
}

interface ChangePasswordParams extends ActionCreators {
  password: string
  currentPassword: string
}

interface ChangeEmailParams extends ActionCreators {
  email: string
  currentPassword: string
}

interface ApplyVoucherParams extends ActionCreators {
  voucherCode: string
}
export default (
  api: ApiInterface<UserData>,
): {
  createGhost: EndpointApi<GhostAccountParams, UserInfo>
  createAccount: EndpointApi<CreateAccountParams, UserInfo>
  changePassword: EndpointApi<ChangePasswordParams, PasswordStatus>
  changeEmailAddress: EndpointApi<ChangeEmailParams, EmailStatus>
  deleteEmailAddress: EndpointApi<ActionCreators, EmailStatus>
  applyVoucher: EndpointApi<ApplyVoucherParams, VoucherStatus>
} => ({
  async createGhost({
    token,
    sessionType,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const { time, client_auth_hash } = getMandatoryParams()
    const opts = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        token,
        time,
        client_auth_hash,
        session_type_id: sessionType,
      }),
    }

    const resp = await api.request({
      method: 'POST',
      endpoint,
      opts,
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })
    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data as UserInfo
  },
  async createAccount({
    username,
    password,
    sessionType,
    params = {},
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const { time, client_auth_hash } = getMandatoryParams()
    const opts = {
      params,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        time,
        client_auth_hash,
        session_type_id: sessionType,
      }),
    }
    const resp = await api.request({
      method: 'POST',
      endpoint,
      opts,
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })

    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data as UserInfo
  },
  async changePassword({
    password,
    currentPassword,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const resp = await api.put({
      endpoint,
      params: { password, current_password: currentPassword },
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })

    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data as PasswordStatus
  },

  async changeEmailAddress({
    email,
    currentPassword,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const resp = await api.put({
      endpoint,
      params: { email, current_password: currentPassword },
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })

    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data as EmailStatus
  },

  async deleteEmailAddress({
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  } = {}) {
    const resp = await api.put({
      endpoint,
      params: { delete_email: 1 },
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })

    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data as EmailStatus
  },

  async applyVoucher({
    voucherCode,
    successfulReduxAction = null,
    failedReduxAction = null,
    loadingReduxAction = null,
  }) {
    const resp = await api.put({
      endpoint,
      params: { voucher_code: voucherCode },
      actionCreators: {
        failedReduxAction,
        loadingReduxAction,
      },
    })

    if (successfulReduxAction) {
      api.dispatcher({
        actionCreator: successfulReduxAction,
        data: resp.data,
        ...api,
      })
    }

    return resp.data as VoucherStatus
  },
})
