/* eslint-disable no-undef */
const blockWorker = () =>
  injectScript(`
    if (typeof wsAllowlisted === 'undefined') {
      window.manageWebWorkers = new (function() {
        let oldWorker = window.Worker
        let newWorker = function() {
          this.addEventListener = function() {}
          this.removeEventListener = function() {}
          this.terminate = function() {}
          this.postMessage = function() {}
        }
        window.Worker = newWorker
      })()
    }
`)

browser.runtime
  .sendMessage({ type: 'get-state', payload: ['workerBlockEnabled'] })
  .then(data => {
    if (data !== undefined && data[0]) blockWorker()
  })
