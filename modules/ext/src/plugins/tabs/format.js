const disallowedProtocols = [
  'chrome-extension:',
  'chrome:',
  'about:',
  'moz-extension:',
]

export default tab => {
  if (!tab || !tab.url) {
    return {
      hostname: 'Could not get tab info',
      hostnameInvalid: true,
    }
  }

  const { hostname, protocol } = new URL(tab?.url)

  if (disallowedProtocols.includes(protocol)) {
    return {
      hostname: 'Invalid hostname',
      hostnameInvalid: true,
    }
  }

  return {
    original: tab.url,
    hostname,
    hostnameInvalid: false,
  }
}
