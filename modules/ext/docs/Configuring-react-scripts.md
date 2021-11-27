# Configuring react-scripts

We use a custom build of react-scripts to support web extensions. You can find the build here: https://github.com/Windscribe/react-scripts-ws-webextension

It includes all packages from the create-react-app repo but the only piece that needs to be focused on is `packages/react-scripts`. It contains all relevant build scripts, helpers and webpack configurations.

## Configuration via `webext.config.js`

The build tool allows configuration overrides plus the ability to run additional functions **before** the bundler starts.

### babel

https://babeljs.io/docs/en/options

Takes a [babel config object](https://babeljs.io/docs/en/options) and combines it with the default bundled into `react-scripts`

### preparationMethods

`Array<() => Promise<any>>`

An array of functions that are executed before the bundler starts. These functions can do whatever you wish but they must return a promise.

### webpack

`(config: WebpackConfig, env: NODE_ENV, platform: string) => WebpackConfig`

Allows the ability to override any portion of the current webpack config. It must return a new webpack config.

| argument | type   | description                                                      |
| -------- | ------ | ---------------------------------------------------------------- |
| config   | Object | react-scripts' webpack config object                             |
| env      | string | the current `NODE_ENV` (development, production, or testing)     |
| platform | string | the current build platform/browser target (firefox, chrome, etc) |
