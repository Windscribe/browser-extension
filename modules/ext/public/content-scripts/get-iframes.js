// TODO: recurively inject this script if needed

setTimeout(
  () => {
    let frames = document.querySelectorAll('iframe')
    frames.forEach(x => {
      try {
        let url = new URL(x.src)
        browser.runtime.sendMessage({ type: 'found-iframe', payload: url })
      } catch (err) {
        // do nothing (likely src is missing or 'about')
      }
    })
  },
  // TODO: make this configurable + potentially listen to iframe creation
  1000,
)
