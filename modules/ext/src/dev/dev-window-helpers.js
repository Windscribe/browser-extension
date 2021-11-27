/* global fetch */

/* Create Iframe for background inspection */
if (process.env.WEB_EXT_UNSAFE_BACKGROUND_IN_IFRAME) {
  const el = document.createElement('iframe')

  el.src = `${window.location.origin}/background.html`

  el.id = 'WEB_EXT_BACKGROUND_FRAME'

  el.height = 0
  el.width = 0

  document.body.appendChild(el)
}

if (process.env.WEB_EXT_USE_REACT_DEVTOOLS) {
  fetch('http://localhost:8097/')
    .then(resp => resp.text())
    /* eslint-disable */
    .then(eval)
}

window.devWindow = true
