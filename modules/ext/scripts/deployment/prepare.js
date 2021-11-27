let path = require('path')
let fs = require('fs-extra')
let logger = require('consola')
let sleep = require('shleep')
let git = require('simple-git/promise')()

let {
  paths,
  exec,
  switchPath,
  getPackage,
  changelogStore,
  getTag,
  getReleaseTagBranch,
  shouldUseFork,
} = require('./utils')
let gitlabApi = require('./gitlab-api')

// TODO: generate the changelog and send it to the tag via gitlab api
let generateChangelog = async () => {
  let changeLogScript = path.join(paths.workSpaceRoot, 'scripts/changelog.sh')
  try {
    let { stdout } = await exec(changeLogScript)

    let changelog = stdout
      .split('\n')
      .map(x => `* ${x}`)
      .filter(x => x !== `* `)
      .join('\n')

    await fs.writeFile(path.join(paths.tmp, 'CHANGELOG'), changelog)
    changelogStore.assignChangelog(changelog)

    return changelog
  } catch (err) {
    console.error('exec error', err)
  }
}

let manifestPath = path.join(paths.root, 'public', 'manifest', 'base.json')
let bumpVersion = async type => {
  let goBack = switchPath(paths.root)
  /* We can start both these at the same time */
  let [manifest] = await Promise.all([
    await fs.readJson(manifestPath),
    exec(`npm version ${type}`),
  ])
  await sleep(400)
  let { version } = getPackage()

  logger.info(`🔖  bumped version to ${version}`)

  /* We want to edit the version number */
  fs.writeJson(manifestPath, { ...manifest, version }, { spaces: 2, EOL: '\n' })

  goBack()

  return version
}

let createReleaseBranch = async version => {
  let releaseTagBranch = getReleaseTagBranch()
  let tag = getTag()
  try {
    /* Avoid uncommited changes warning */
    await git.stash()
    /* Create release branch */
    logger.info(`↪️  Creating new release branch`)
    logger.info(`checking out ${version}`)
    await git.checkoutLocalBranch(releaseTagBranch)
    /* reapply changes */
    await git.stash(['apply'])
    await sleep(500)
    /* Commit & push */
    await git.add('.')
    await git.commit(`:package: ${tag}`)
    /* TODO: create PR  */
    await gitlabApi.post('merge_requests', {
      source_branch: releaseTagBranch,
      target_branch: 'master',
      title: `:package: ${tag}`,
    })
  } catch (e) {
    logger.error('🚨  Error creating release branch', e)
    throw e
  }
}

let setupTag = async () => {
  let tag = getTag()
  try {
    /* Create Tag */
    logger.info(`↪️  adding new tag: ${tag}`)
    await git.addTag(tag)
    // return
  } catch (e) {
    logger.error(`🚨  Error creating tag`, e)
    throw e
  }
}

module.exports.pushTags = async () => {
  let releaseTagBranch = getReleaseTagBranch()
  let tag = getTag()
  try {
    let remote = shouldUseFork() ? 'fork' : 'origin'
    await git.push(remote, releaseTagBranch)
    logger.info(`↪️  release branch ${releaseTagBranch} pushed`)
    await git.push(remote, tag)
    logger.success(`tag ${tag} pushed`)
  } catch (e) {
    throw e
  }

  /* Write changelog to tag */
  try {
    await gitlabApi.post(`repository/tags/${tag}/release`, {
      description: changelogStore.getChangelog(),
    })
  } catch (e) {
    if (e.status === 404) {
      logger.error('🚨  Could not find tag')
    }
  }
}

module.exports.prepare = async updateType => {
  // Current branch

  let { current } = await git.branchLocal()

  if (current !== 'master' && !process.env.DISABLE_MASTER_CHECKOUT) {
    logger.info('↪️ checking out master... pulling latest changes')
    await git.checkout('master')
    await git.pull()
  }

  let version = await bumpVersion(updateType)
  await createReleaseBranch(version)
  await generateChangelog()
  await setupTag()
}
