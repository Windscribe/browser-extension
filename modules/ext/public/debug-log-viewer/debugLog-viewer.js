// Periodically ask for the latest log line
let shouldScroll = false

let debugLogContainer = document.querySelector('#debug-log')
let backToBottomButton = document.querySelector('.view-logs')
let autoscrollToggle = document.querySelector('#toggle-autoscroll')
let clearButton = document.querySelector('.clear-debug-log')
let userInfoContainer = document.querySelector('.user-info-container')
let toggleUserInfoButton = document.querySelector('.toggle-user-info')

let clearLog = () => {
  browser.runtime.sendMessage({ type: 'clear-debug-log' })
  debugLogContainer.innerText = ''
}

let fetchLogHeader = () =>
  browser.runtime.sendMessage({ type: 'construct-log-header' })

let fetchDebugLog = () =>
  browser.runtime.sendMessage({ type: 'construct-debug-log' })

let writeDebugLog = str => {
  if (str) {
    debugLogContainer.innerText += str
  }

  return Promise.resolve()
}

let scrollToBottom = ({ override } = { override: false }) => {
  if (shouldScroll || override) {
    window.scrollTo(0, document.body.scrollHeight)
  } else {
    backToBottomButton.classList.add('showing')
  }
}

let setupLogListener = () => {
  browser.runtime.onMessage.addListener(req => {
    if (req.type === 'cs_debug-log-entry') {
      debugLogContainer.innerText += req.payload
      scrollToBottom()
    }
  })
}

clearButton.addEventListener('click', clearLog)

toggleUserInfoButton.addEventListener('click', () =>
  document.querySelector('.user-info-container').classList.toggle('showing'),
)

Array.from(document.querySelectorAll('.scroll-to-bottom')).forEach(node =>
  node.addEventListener('click', () => scrollToBottom({ override: true })),
)

backToBottomButton.addEventListener('click', () => {
  scrollToBottom({ override: true })
  backToBottomButton.classList.remove('showing')
})

autoscrollToggle.addEventListener('change', e => {
  shouldScroll = e.currentTarget.checked
})

fetchLogHeader()
  .then(header => {
    userInfoContainer.innerText += header
    return writeDebugLog(header)
  })
  .then(fetchDebugLog)
  .then(writeDebugLog)
  .then(() => {
    scrollToBottom()
    setupLogListener()
  })
