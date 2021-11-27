let path = require('path')
let fs = require('fs-extra')
let slack = require('slack')
let { paths, changelogStore } = require('./utils')

let token = process.env.SLACK_BOT_TOKEN
let channel = process.env.SLACK_DEPLOY_CHANNEL || 'bot-test'

module.exports = async () => {
  // We should upload everything in `dist`
  let artifacts = await fs.readdir(paths.dist)

  ;[
    process.env.SLACK_BOT_MESSAGE || 'Please ignore',
    changelogStore.getChangelog(),
  ].forEach(text => slack.chat.postMessage({ token, channel, text }))

  artifacts.forEach(file =>
    slack.files.upload({
      token,
      channels: channel,
      file: fs.createReadStream(path.join(paths.dist, file)),
    }),
  )
}
