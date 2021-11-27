const RENDER_TARGET = '#render'

const render = markup => {
  document.querySelector(RENDER_TARGET).innerHTML = markup
}

const enableAdvancedModeTemplate = `
      <div class="flex col align-center justify-center">
        <div class="logo">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
              <path
                d="M20 0c-.36 0-.73.07-1.07.21L6.77 5.26c-.68.28-1.22.82-1.5 1.5L.2 18.91a2.79 2.79 0 0 0 0 2.13l5.06 12.22c.28.69.82 1.23 1.5 1.51L18.9 39.8a2.8 2.8 0 0 0 2.14 0l12.19-5.02a2.78 2.78 0 0 0 1.52-1.51l5.05-12.22c.28-.68.28-1.45 0-2.13L34.73 6.76a2.79 2.79 0 0 0-1.5-1.5L21.07.2A2.8 2.8 0 0 0 20 0"
                fill="#020D1C"
              />
              <path
                d="M20 0c-.36 0-.73.07-1.07.21L6.77 5.26c-.68.28-1.22.82-1.5 1.5L.2 18.91a2.79 2.79 0 0 0 0 2.13l5.06 12.22c.28.69.82 1.23 1.5 1.51L18.9 39.8a2.8 2.8 0 0 0 2.14 0l12.19-5.02a2.78 2.78 0 0 0 1.52-1.51l5.05-12.22c.28-.68.28-1.45 0-2.13L34.73 6.76a2.79 2.79 0 0 0-1.5-1.5L21.07.2A2.8 2.8 0 0 0 20 0m0 3.04c.04 0 .07 0 .1.02l11.8 4.89c.06.03.12.08.15.15l4.9 11.77c.02.07.02.15 0 .21l-4.9 11.85a.28.28 0 0 1-.16.15l-11.82 4.86a.27.27 0 0 1-.21 0L8.1 32.08a.28.28 0 0 1-.15-.15l-4.9-11.85a.27.27 0 0 1 0-.2L7.96 8.1a.28.28 0 0 1 .15-.15l11.78-4.9a.28.28 0 0 1 .11-.01m6.2 21.86L20 18.2l-6.2 6.7V12h-3.1v16h2.85a3.1 3.1 0 0 0 2.2-.9L20 22.31l4.26 4.77c.58.58 1.37.9 2.2.9h2.84V12h-3.1v12.9z"
                fill="#FFF"
              />
            </g>
          </svg>
        </div>
        <div class="content-container">
          <h1>
            Advanced features disabled. Worry not, you can enable them in the
            extension.
          </h1>

          <p>
            Go to Preferences > Privacy > Advanced Mode
          </p>
        </div>
      </div>
    `

const setAdvancedView = advancedMode => {
  if (advancedMode) {
    render('') //clear prev view
    let iframe = document.createElement('iframe')
    iframe.src = '../dashboard.html'
    iframe.className = 'ublock-frame'

    document.querySelector(RENDER_TARGET).appendChild(iframe)
  } else {
    render(enableAdvancedModeTemplate)
  }
}

//listen for updates to advanced mode, if any
const optionsAdvancedModeListener = res => {
  if (!res) return
  const { payload, type } = res.payload
  if (type === 'advancedModeEnabled_SET') {
    setAdvancedView(payload)
  }
}
if (!browser.runtime.onMessage.hasListener(optionsAdvancedModeListener))
  browser.runtime.onMessage.addListener(optionsAdvancedModeListener)

browser.runtime
  .sendMessage({
    type: 'get-state',
    payload: 'advancedModeEnabled',
  })
  .then(advancedMode => {
    setAdvancedView(advancedMode)
  })
