/* global describe, before, after, it, window */

import getGhostTests from 'tests/ghost'
const fs = require('fs-extra')
const rimraf = require('rimraf')
const path = require('path')
const argv = require('yargs')
  .alias('W', 'whitelist')
  .array('W')
  .boolean('keepOpen')
  .boolean('autoConnect')
  .boolean('e2e')
  .boolean('ghost')
  .boolean('logic').argv
const chai = require('chai')
const assert = chai.assert
const puppeteer = require('puppeteer')
const { screenshot } = require('../src/tests/helpers')
const sleep = require('shleep')
const server = require('tests/server/local-server')
const getLogicTests = require('tests/logic')
const getE2eTests = require('tests/e2e')
const extPath = path.resolve(__dirname, '..', 'build')
const { name } = fs.readJSONSync(path.resolve(extPath, 'manifest.json'))
const userDataDir = path.resolve(__dirname, 'chrome_user_data')

// start with fresh browser data (cb is mandatory but useless)
rimraf(userDataDir, () => {})

/* entry point for extension integration test */

// using puppeteer 1.6.0 https://pptr.dev/
// inspiration: https://github.com/GoogleChrome/lighthouse/pull/4640/files

// Access chrome object in Extensions
// https://github.com/GoogleChrome/puppeteer/issues/2878

const EXT_LOAD_DELAY = 100
const extPopupHtml = 'popup.html'
const port = process.env.TEST_SERVER_PORT || 1337
let browser, bgPage, page, expressServerListener

let launchBrowser = () =>
  (global.browser = puppeteer.launch({
    headless: false,
    devtools: false,
    dumpio: true,
    product: 'firefox',
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      `--gpu-disable`,
    ].concat(
      process.env.DISABLE_SANDBOX
        ? ['--no-sandbox', '--disable-setuid-sandbox']
        : [],
    ),
  }))

let setupBrowser = async ({ showPopup }) => {
  browser = await launchBrowser()

  await sleep(EXT_LOAD_DELAY)

  const targets = await browser.targets()

  const extTarget = targets.find(
    ({ _targetInfo }) =>
      _targetInfo.type === 'background_page' && _targetInfo.title === name,
  )

  // extract id to open popup.html
  const extUrl = extTarget._targetInfo.url || ''
  const [, , extID] = extUrl.split('/')

  page = await browser.newPage()
  page.goto(extTarget._targetInfo.url)

  if (showPopup) {
    await page.goto(`chrome-extension://${extID}/${extPopupHtml}`)
    await page.waitFor(3000)
    await page.reload()
    await page.tracing.start({
      path: path.resolve(`./automated_tests/traces/trace.json`),
    })
  }

  // wait for page to load
  await page.waitFor(3000)
  const backgroundPageTarget = targets.find(
    target => target.type() === 'background_page',
  )
  bgPage = await backgroundPageTarget.page()
}

// TODO: support running test server on different port

describe('chrome extension', () => {
  before(async () => {
    expressServerListener = server.listen(port)
    await setupBrowser({ showPopup: argv.e2e || argv.ghost })
  })

  const logicTests = argv.logic ? getLogicTests(argv.whitelist) : []
  const e2eTests = argv.e2e ? getE2eTests(argv.whitelist) : []
  const ghostTests = argv.ghost ? getGhostTests(argv.whitelist) : []
  const allTests = [...logicTests, ...e2eTests, ...ghostTests]

  for (let t of allTests) {
    // eslint-disable-next-line no-loop-func
    it(t.it, async () => {
      if (t.before) {
        await t.before(page)
      }

      if (t.eval) {
        const evalRes = await bgPage.evaluate(t.eval, {
          testUser: global.TEST_USER,
        })
        t.assert(evalRes)
      }

      if (t.run) {
        const runRes = await t.run(page)
        t.assert(runRes)
      }

      if (t.snapshot) {
        await screenshot(page, t.name)
      }

      await page.waitFor(500)
    })
  }

  after(async () => {
    let close = async () => {
      if (!argv.logic) {
        await page.tracing.stop()
      }
      // pop the debug log to a file
      const log = await bgPage.evaluate(async () => {
        return await window.constructDebugLog()
      })
      await fs.outputFile(
        path.resolve(`./automated_tests/debugLog.txt`),
        log,
        err => {
          browser.close()
          expressServerListener.close()
          if (err) {
            return console.error(err)
          }
        },
      )
    }
    argv.keepOpen ? process.on('exit', close) : await close()
    rimraf(userDataDir, () => {})
  })
})

// TODO: this implementation is way too unreliable.
// we need to tell the browsers to start new sessions with default proxy
// settings aka DIRECT ({ mode: 'system '})
if (argv.autoConnect) {
  let precloseSettings

  describe('autoConnect feature ON (restart browser)', () => {
    before(async () => {
      precloseSettings = await bgPage.evaluate(async () => {
        window.store.dispatch(window.actions.autoConnect.set(true))
        await window.setLocation(
          window.constants.ENVS[window.ENV].TEST_LOCATION,
        )
        const settings = await new Promise(resolve => {
          browser.proxy.settings.get({}, resolve)
        })
        return settings
      })

      await page.close()
      await bgPage.close()
      await browser.close()
      await setupBrowser()
    })

    it('should have retained the true autoConnect state', async () => {
      let autoConnect = await bgPage.evaluate(async () => {
        return window.store.getState().autoConnect
      })
      assert(autoConnect === true, 'autoConnect state did not persist restart')
    })

    it('should have left / assured the browser loads with its last proxy settings', async () => {
      let settings = await bgPage.evaluate(async () => {
        const settings = await new Promise(resolve => {
          browser.proxy.settings.get({}, resolve)
        })

        return settings
      })

      assert.equal(
        settings.value.mode,
        'pac_script',
        `proxy settings before restarting were: \n\n${JSON.stringify(
          precloseSettings,
          null,
          2,
        )}`,
      )
    })
  })

  describe('autoConnect feature OFF (restart browser)', () => {
    before(async () => {
      // set autoConnect to false before closing browser
      await bgPage.evaluate(async () => {
        window.store.dispatch(window.actions.setConnect.set(false))
      })

      await page.close()
      await bgPage.close()
      await browser.close()
      await setupBrowser()
    })

    it('should have retained the false autoConnect state', async () => {
      let autoConnect = await bgPage.evaluate(async () => {
        return window.store.getState().autoConnect
      })
      assert(autoConnect === false, 'autoConnect state did not persist restart')
    })

    // TODO: test that the browser in fact RETAINS its proxy state on restart
    // (when autoConnect is true)

    it('should turn proxy off asap if autoConnect is false', async () => {
      let settings = await bgPage.evaluate(async () => {
        const settings = await new Promise(resolve => {
          browser.proxy.settings.get({}, resolve)
        })

        return settings
      })

      assert.deepEqual(settings.value, { mode: 'system' })
    })
  })
}
