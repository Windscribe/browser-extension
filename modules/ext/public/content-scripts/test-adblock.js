console.log('Hello from cs', Date.now())
/* global browser */
const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

// Check if ads loaded

let checkAds = async () => {
  let adBlockDetected = document.querySelector('.bool').innerHTML === 'true'

  console.log(adBlockDetected)
  browser.extension.sendMessage({
    namespace: 'WS_EXT_TEST_SUITE',
    payload: { adBlockDetected },
  })
}

setTimeout(checkAds, 2000)
