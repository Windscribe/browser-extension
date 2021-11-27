// eslint-disable-next-line no-unused-vars
/* global window */
const { getState, screenshot, click } = require('../helpers')

module.exports = [
  {
    name: 'onBoarding',
    target: 'chrome',
    it: 'should start onBoarding',
    run: async popup => {
      const { view } = await getState(popup)
      if (view.current === 'Welcome') {
        // start from modal
        await click(popup, 'button:first-of-type')
      } else {
        // start from ui, reload sends you to main
        await popup.reload()
        await click(popup, 'button[aria-label="Preferences"]')
        await click(popup, 'button[aria-label="RestartOnboarding"]')
      }
      let onboardSlide = 0
      try {
        do {
          onboardSlide++
          await screenshot(popup, `onBoarding${onboardSlide}`)
          await click(popup, 'button[title="Next"]')
        } while (
          await popup.waitForSelector('button[title="Next"]', {
            timeout: 1000,
            visible: true,
          })
        )
      } catch {
        const lastSelector = 'button[title="Last"]'
        await screenshot(popup, `onBoarding${++onboardSlide}`)
        try {
          await popup.waitForSelector(lastSelector, {
            timeout: 10000,
            visible: true,
          })
          await popup.click(lastSelector)
        } catch (e) {
          return true
        }
      }
    },
    assert: () => {
      return true
    },
  },
]
