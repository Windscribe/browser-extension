import moment from 'moment-timezone'

// generate appropriate string to display on toolTips for proxy time feature
export default ({ timezone, status, proxyTimeEnabled }) => {
  if (!proxyTimeEnabled) {
    return null
  }
  let currentTimeZone = moment.tz.guess()

  let proxiedTime = moment()
  if (status === 'connected' && timezone) {
    currentTimeZone = timezone
    proxiedTime = moment().tz(currentTimeZone)
  }

  let proxyText = `${proxiedTime.format('h:mm A')}`

  if (currentTimeZone) {
    proxyText += ` (${currentTimeZone.split('_').join(' ')})`
  }
  return proxyText
}
