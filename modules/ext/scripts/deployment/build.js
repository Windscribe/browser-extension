let path = require('path')
let fs = require('fs-extra')
let logger = require('consola')
let archiver = require('archiver')
let { default: webExt } = require('web-ext')
let pullUblock = require('../ublock/pull-ublock')
let { getPackage, switchPath, paths, exec } = require('./utils')

let runProdBuild = async () => {
  logger.info(`🛠  running prod build...`)
  switchPath(paths.root)

  try {
    await exec('npm run build')

    return logger.success(`Prod build finished`)
  } catch (e) {
    logger.error(`🚨  problem with building prod`, e)
    throw e
  }
}

let zipChrome = () =>
  new Promise((resolve, reject) => {
    logger.info('📦 Zipping up chrome')
    let { version } = getPackage()
    let output = fs.createWriteStream(
      path.join(paths.dist, `ext@${version}-chrome.zip`),
    )
    let archive = archiver('zip', { zlib: 9 })

    output.on('close', () => {
      resolve()
      logger.success('📦 chrome archive created')
    })

    output.on('end', () => {
      // console.log('Data has been drained')
      logger.success('📦 chrome archive created')
      resolve()
    })

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        logger.error(err)
        // log warning
      } else {
        // throw error
        throw err
      }
    })

    // good practice to catch this error explicitly
    archive.on('error', err => {
      reject(err)
      throw err
    })

    // pipe archive data to the file
    archive.pipe(output)
    archive.directory(path.join(paths.build, 'chrome'), false)
    archive.finalize()
  })

let signFirefoxXpi = async () => {
  let signingAuthCreds = {
    id: process.env.FIREFOX_DEPLOYMENT_EXT_ID,
    apiKey: process.env.FIREFOX_DEPLOYMENT_API_KEY,
    apiSecret: process.env.FIREFOX_DEPLOYMENT_API_SECRET,
  }

  try {
    logger.info(`🦊  signing XPI`)
    /*
    See: https://github.com/mozilla/web-ext/blob/master/src/cmd/sign.js#L24

    `sign` for params
    */
    await webExt.cmd.sign({
      ...signingAuthCreds,
      sourceDir: path.join(paths.build, 'firefox'),
      artifactsDir: path.join(paths.dist),
      overwriteDest: true,
      showReadyMessage: false,
      channel: 'unlisted',
    })
    logger.success(`🦊  xpi signed`)

    let { version } = getPackage()
    // Find the xpi and rename to fit our naming convention
    let [xpi] = fs.readdirSync(paths.dist).filter(x => x.endsWith('.xpi'))
    fs.renameSync(
      path.join(paths.dist, xpi),
      path.join(paths.dist, `ext@${version}.xpi`),
    )

    return
  } catch (e) {
    logger.error('🚨 Could not sign XPI', e)
    throw e
  }
}

module.exports = async () => {
  if (await fs.pathExists(paths.dist)) {
    await fs.emptyDir(paths.dist)
  } else {
    await fs.ensureDir(paths.dist)
  }

  await pullUblock()
  await runProdBuild()
  await zipChrome()
  await signFirefoxXpi()

  return
}
