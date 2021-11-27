let testUa = () => {
  let el = document.querySelector('.current-ua')

  browser.runtime.sendMessage({ namespace: 'ws-test', payload: el.innerText })
}

setTimeout(testUa, 1000)
