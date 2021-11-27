let cookies = document.cookie
  .split(';')
  .reduce((res, c) => {
    const [key, val] = c.trim().split('=').map(decodeURIComponent)
    try {
      return Object.assign(res, { [key]: JSON.parse(val) })
    } catch (e) {
      return Object.assign(res, { [key]: val })
    }
  }, {});

if (cookies?.ws_session_auth_hash) {
  browser.runtime.sendMessage({
    type: 'loginswap',
    payload: cookies.ws_session_auth_hash,
  })
}
