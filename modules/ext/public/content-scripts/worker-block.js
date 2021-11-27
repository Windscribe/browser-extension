const blockWorker = () => {
  const content =
    'window.manageWebWorkers = new (function () { let oldWorker = window.Worker; let newWorker = function () { this.addEventListener = function () {}; this.removeEventListener = function () {}; this.terminate = function () {}; this.postMessage = function () {}; }; window.Worker = newWorker; })(); '
  const script = document.createElement('script')
  script.textContent = content
  document.documentElement.insertBefore(script, document.head)
  script.remove()
}

browser.runtime
  .sendMessage({ type: 'get-state', payload: ['workerBlockEnabled'] })
  .then(data => {
    if (data !== undefined && data[0]) blockWorker()
  })
