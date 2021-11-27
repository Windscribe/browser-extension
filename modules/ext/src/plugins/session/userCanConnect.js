import { ACCOUNT_PLAN } from 'utils/constants'

/* Premium users can connect to anything */
export default (is_premium, locationPermission) =>
  is_premium === ACCOUNT_PLAN.PREMIUM || is_premium === locationPermission
