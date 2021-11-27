export default data =>
  new Promise((resolve, reject) => {
    function oncopy(event) {
      try {
        document.removeEventListener('copy', oncopy, true)
        // Hide the event from the page to prevent tampering.
        event.stopImmediatePropagation()

        // Overwrite the clipboard content.
        event.preventDefault()
        event.clipboardData.setData('text/plain', data)

        resolve()
      } catch (e) {
        reject(e)
      }
    }
    document.addEventListener('copy', oncopy, true)
    // Requires the clipboardWrite permission, or a user gesture:
    document.execCommand('copy')
  })
