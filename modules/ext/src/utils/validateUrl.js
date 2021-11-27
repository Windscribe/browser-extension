import { isUri } from 'valid-url'
import isValidDomain from 'is-valid-domain'

export default link => {
  /* Check if it's a wild-carded domain */
  if (link.startsWith('*.')) {
    // Remove the wildcard to remove the rest
    const [, ...domain] = link.split('*.')
    return isValidDomain(domain[0])
  }

  /* If it's a uri */
  if (isUri(link)) {
    return true
  }

  return isValidDomain(link)
}
