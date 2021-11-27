const removeCookie = cookie => {
  const url =
    'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path
  browser.cookies.remove({ url, name: cookie.name })
}

export default () =>
  browser.cookies.getAll({}).then(allCookies => {
    const count = allCookies.length
    for (let i = 0; i < count; i++) {
      removeCookie(allCookies[i])
    }
  })
