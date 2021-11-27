const argv = require('yargs').argv

require('@babel/register')({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '9',
        },
        exclude: ['transform-regenerator'],
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-optional-chaining',
  ],
})

if (argv.script) require(`./${argv.script}`)
