const path = require('path')
const c = require('child_process')
const { promisify } = require('util')
const Git = require('simple-git/promise')

const fs = require('fs-extra')
const rf = require('rimraf')
const logger = require('consola')
const ora = require('ora')
const sleep = require('shleep')

const exec = promisify(c.exec)
const rimraf = promisify(rf)

const repoUrl = 'https://github.com/Windscribe/uBlock'
const ublockAssetsUrl = 'https://github.com/uBlockOrigin/uAssets'

const { uBlockVersion } = fs.readJSONSync(
  path.resolve(__dirname, '..', '..', 'package.json'),
)

const platforms = ['firefox', 'chrome']

// Dirs
const cwd = process.cwd()
const tmp = path.resolve(__dirname, '..', '..', 'tmp')
const ublockTmp = path.resolve(tmp, 'uBlock')
const ublockAssetsTmp = path.resolve(tmp, 'uAssets')

const publicDir = path.resolve(__dirname, '..', '..', 'public', 'ublock')
const assetsFile = platform =>
  path.resolve(publicDir, platform, 'assets', 'assets.json')

const projects = [
  { url: repoUrl, dir: ublockTmp },
  { url: ublockAssetsUrl, dir: ublockAssetsTmp },
]

const cloneProject = async () => {
  //const spinner = ora(`Cloning ublock ${uBlockVersion}`)
  logger.info(`Cloning ublock ${uBlockVersion}`)
  try {
    //spinner.start()

    await Promise.all(projects.map(x => Git().clone(x.url, x.dir)))

    //spinner.stop()
    console.clear() // eslint-disable-line

    logger.success('Pulled ublock repo')

    logger.info('checking out tag')
    // Checkout version
    await Git(ublockTmp).checkout(uBlockVersion)

    logger.success(`Successfully checked out version ${uBlockVersion}`)
    return
  } catch (e) {
    //spinner.stop()
    throw e
  }
}

const buildUblock = async () => {
  // Run the build
  const filesToMove = ['LICENSE.txt', 'README.md']
  const filesToRemove = ['popup.html', 'background.html', 'manifest.json']

  logger.start('Building webextension')

  process.chdir(ublockTmp)

  try {
    await exec('tools/make-firefox.sh')
    await exec('tools/make-chromium.sh')

    // Move the build into public/ublock
    // await fs.move('dist/build/uBlock0.chromium', publicDir)
    await fs.move('dist/build/uBlock0.firefox', path.join(publicDir, 'firefox'))
    await fs.move('dist/build/uBlock0.chromium', path.join(publicDir, 'chrome'))

    for (let platform of ['chrome', 'firefox']) {
      filesToMove.forEach(name =>
        fs.copyFile(name, path.join(publicDir, platform, name)),
      )
      filesToRemove.forEach(name =>
        fs.remove(path.resolve(publicDir, platform, name)),
      )
    }

    logger.success('Webextension build')
    return
  } catch (e) {
    logger.error('Failed to build webextension')
    throw e
  }
}

const addWSblockLists = async () => {
  // Load json file
  return Promise.all(
    platforms.map(platform =>
      fs.writeJSON(assetsFile(platform), {}, { spaces: 2 }),
    ),
  )
}

const removeAssets = () => {
  // Remove everything in the assets folder but `assets.json`
  let dirsToRemove = ['assets/thirdparties', 'assets/ublock']

  let removeDirs = platform =>
    Promise.all(
      dirsToRemove.map(dir => rimraf(path.join(publicDir, platform, dir))),
    )

  return Promise.all(platforms.map(removeDirs))
}

const cleanup = () => rimraf(tmp)

const init = async () => {
  if (fs.existsSync(tmp)) {
    rimraf(tmp)
  }
  await rimraf(publicDir)

  await sleep(500)

  await fs.ensureDir(ublockTmp)

  await sleep(500)
}

module.exports = async ({ exit = true } = {}) => {
  if (exit) {
    process.on('beforeExit', () => {
      logger.log('Process exiting.')
      process.exit()
    })
  }

  return init()
    .then(() =>
      fs.existsSync(ublockTmp) && fs.existsSync(ublockAssetsTmp)
        ? rimraf(publicDir)
        : Promise.resolve(),
    )
    .then(cloneProject)
    .then(buildUblock)
    .then(addWSblockLists)
    .then(removeAssets)
    .then(cleanup)
    .catch(err => {
      logger.error(err)
      cleanup()
      if (exit) process.exit()
    })
}
