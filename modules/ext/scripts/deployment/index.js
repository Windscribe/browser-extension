let logger = require('consola')
let meow = require('meow')
let sleep = require('shleep')
let fs = require('fs-extra')
let git = require('simple-git/promise')()

let { paths, getReleaseTagBranch, getTag } = require('./utils')

let { prepare, pushTags } = require('./prepare')
let build = require('./build')
let upload = require('./upload')

const REQUIRED_ENVS = [
  'FIREFOX_DEPLOYMENT_API_KEY',
  'FIREFOX_DEPLOYMENT_API_SECRET',
  'FIREFOX_DEPLOYMENT_EXT_ID',
  'TAG_NAME',
  'SLACK_BOT_TOKEN',
  'GITLAB_API_KEY',
]

/* Check for required envs */
let missingArgs = REQUIRED_ENVS.filter(x => !process.env[x])
if (missingArgs.length) {
  /* List all missing args and exit */
  logger.error(`🚨 Looks like you're missing envs.`)
  logger.log('Have you checked your .env file?')
  /* eslint-disable */
  console.log("");

  logger.info("List of missing args:");
  missingArgs.forEach(arg => logger.log(arg));
  console.log("");
  /* eslint-enable */

  process.exit(1)
}

let updateTypes = [
  'major',
  'minor',
  'patch',
  'premajor',
  'preminor',
  'prepatch',
  'prerelease',
]

let cli = meow(`
  Usage
    $ cmd <newversion> ${updateTypes.map(type => type).join(' | ')}
`)

/* tmp/ will be destroyed by the ublock script */
fs.ensureDirSync(paths.tmp)

let cleanup = async error => {
  if (error) {
    logger.error('The script failed due to an error at runtime.')
    logger.info(new Error(error))
  }
  logger.info('Running cleanup')
  await sleep(300)

  logger.info(`🔥 Removing branch and tag`)
  let releaseTagBranch = getReleaseTagBranch()
  let tag = getTag()

  await git.checkout('master')
  await git.pull('origin', 'master')
  await git.raw(['branch', '-D', releaseTagBranch])
  await git.raw(['tag', '-d', tag])
}

/* Main */
;(async () => {
  let [updateType] = cli.input
  if (!updateType) {
    cli.showHelp()
    process.exit()
  }

  logger.start('Starting deployment')
  await sleep(200)

  try {
    await prepare(updateType)
    await build()
    await upload()

    logger.success(`🎉  Deployment completed! Have a good day!!`)
  } catch (e) {
    await cleanup(e)
    process.exit(1)
  }

  try {
    await pushTags()
  } catch (e) {
    logger.error('Error pushing tags')
    throw e
  }

  /* TODO:
    deploy to deploy targets
  */
})()
