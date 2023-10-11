import { flatten } from 'lodash'
import login from './login'
import onBoarding from '../e2e/onBoarding'
// import createUser from '../admin/createTestUser'
import checkNav from './checkNav'

const domains = {
  // createUser,
  login,
  onBoarding,
  checkNav,
}

export default (allowlist = []) =>
  allowlist.length
    ? flatten(
        Object.entries(domains)
          .filter(([key]) => allowlist.includes(key))
          .map(([, v]) => v),
      )
    : flatten(Object.values(domains))
