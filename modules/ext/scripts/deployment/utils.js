let { exec: _exec } = require('child_process')
let fs = require('fs-extra')
let path = require('path')
let logger = require('consola')
let sleep = require('shleep')

let root = path.resolve(__dirname, '../../')
let getPackage = () => fs.readJsonSync(path.resolve(root, 'package.json'))

/* We'll store the changelog here for the time being */
let changelog

module.exports.getPackage = getPackage

module.exports.switchPath = path => {
  let cwd = process.cwd()
  process.chdir(path)
  return () => process.chdir(cwd)
}

module.exports.getPlatforms = () => {
  let pkg = getPackage()

  if (pkg.platforms) {
    return pkg.platforms
  } else {
    return ['chrome', 'firefox']
  }
}

module.exports.paths = {
  root,
  build: path.resolve(root, 'build'),
  dist: path.resolve(root, 'dist'),
  tmp: path.resolve(root, 'tmp'),
  workSpaceRoot: path.resolve(root, '../../'),
}

module.exports.getManifest = target =>
  fs.readJSONSync(path.resolve(root, `build/${target}/manifest.json`))

module.exports.notifyUpload = async target => {
  console.group('-------------') // eslint-disable-line no-console
  logger.start(`☁️ Running ${target} upload`)
  console.groupEnd() // eslint-disable-line no-console

  await sleep(300)

  return
}

module.exports.exec = cmd =>
  new Promise((resolve, reject) => {
    _exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err)

      resolve({ stdout, stderr })
    })
  })

/* Quick and dirty way to access the */
module.exports.changelogStore = {
  getChangelog: () => changelog,
  assignChangelog: text => {
    changelog = text

    return changelog
  },
}

module.exports.getTag = () =>
  `${process.env.TAG_NAME || 'ext'}@${getPackage().version}`
module.exports.getReleaseTagBranch = () =>
  `tag-release-ext@${getPackage().version}`

module.exports.shouldUseFork = () => process.env.USE_FORK || false
