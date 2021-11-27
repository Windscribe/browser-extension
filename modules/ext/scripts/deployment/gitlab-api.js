let axios = require('axios').default
let { shouldUseFork } = require('./utils')

let apiKey = process.env.GITLAB_API_KEY
// We need the api Key
if (!apiKey) {
  throw new TypeError('process.env.GITLAB_API_KEY is undefined.')
}

let apiVersion = 'v4'
let projectId = shouldUseFork() ? 116 : 17
let conf = {
  baseURL: `https://gitlab.int.windscribe.com/api/${apiVersion}/projects/${projectId}`,
  headers: {
    'PRIVATE-TOKEN': apiKey,
  },
}

let instance = axios.create(conf)

module.exports = instance
