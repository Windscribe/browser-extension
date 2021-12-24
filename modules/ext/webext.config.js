const path = require('path')
const fs = require('fs-extra')
const logger = require('consola')
const sleep = require('shleep')
const CopyPlugin = require('copy-webpack-plugin')

// hacks: https://github.com/joefitzgerald/go-plus/issues/249
const cwd = process.cwd()
const resetCwd = () => {
  process.chdir(cwd)

  return sleep(500)
}

const pullUbo = (target, spinner) => {
  if (fs.pathExistsSync(path.resolve('public/ublock'))) {
    return
  }
  spinner.text = 'Pulling and building ubo. This may take a few minutes'
  //logger.warn('Ubo source missing')
  //logger.info('Pulling and building ubo. This may take a few minutes')
  return require('./scripts/ublock/pull-ublock')()
}

module.exports = {
  babel: {
    presets: ['@emotion/babel-preset-css-prop'],
    plugins: [
      // TODO: setup prod config
      ['emotion', { sourceMap: true, autoLabel: true }],
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-optional-chaining',
    ],
  },
  preparationMethods: [pullUbo, resetCwd],
  webpack: (config, env, platform = 'chrome') => {
    return {
      // eslint-disable-line
      ...config,
      plugins: [
        ...config.plugins,
        new CopyPlugin([
          { from: path.join('public/icons') },
          { from: path.join('public/fonts'), to: 'fonts' },
          { from: path.join('public/popup.css') },
          { from: path.join('public/debug-log-viewer') },
          { from: path.join(`public/ublock/${platform}`) },
          { from: path.join('public/options-ui'), to: 'options-ui' },
          { from: path.join('public/content-scripts'), to: 'content-scripts' },
          { from: path.join('public/browser-polyfill.min.js.map') },
        ]),
      ],
    }
  },
}
