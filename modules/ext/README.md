## Windscribe WebExtension Development

This project uses a custom create-react-app script as its primary build tool:

https://github.com/Windscribe/react-scripts-ws-webextension

It also pulls down and builds our clone of uBlock:

https://github.com/Windscribe/uBlock

### Quickstart

#### Copy env schema and fill in values 

(if you have not already ran `make` from root)

```
cp .env.schema .env
```

#### Start development server

##### Chrome

```
yarn start-chrome
```

This command will build the extension and refresh the build folder as code changes are made. If the extension is loaded (ie. in chrome: `chrome://extensions`), then you should be able to open the development window by right clicking anywhere in the browser and selecting to appropriate option in the context menu:

![ctx-menu](https://i.imgur.com/9PGwpnb.png)

The debug log is extremely helpful. You can open that up via the context menu as well.

##### Firefox

```
yarn start-ff
```

#### Run automated tests

_..tests might fail, that's okay.._

```
yarn test
```

### Build

(Creates a build folder with both chrome and firefox folders)

```
yarn build
```

### Deploy

* build for production, 
* update package.json versions
* create a commit and a tag
* push the tag to gitlab and make a merge request
* create an xpi for firefox and a zip for chrome
* post the artifacts in slack

*NOTE: this requires your .env file to have proper values*

```
yarn deploy <version>
```

### Plugin Architecture

To create a plugin, add a folder in `src/plugins/<your_plugin_name>` and give it an `index.js` file which returns an object. All keys are optional.

```js
export default {
  // defines keys and their initial states on the root reducer
  lexiconEntries: Array<LexiconEntry>,
  // A function that returns redux-logic middleware
  logic: actions => Array<Logic>,
  // run on extension install or browser bootup
  initialize: () => void
  // browser tab events
  onTabCreated: tabInfo => void,
  onTabActivated: tabInfo => void,
  onTabUpdated: (tabId, changeInfo) => void,
  onTabRemoved: id => void,
  // window events
  onWindowFocusChanged: windowId => void,
  // webRequest events
  onWebRequestAuthRequired: details => Credentials | Cancel, // Only one plugin can set this
  onWebRequestHeadersReceived: details => void,
  onWebRequestCompleted: details => void,
  onProxyError: details => void,
  // browser runtime messages
  onMessage: {
    messageType(message, sender) => Promise | undefined,
  },
  // internet connectivity events
  onOnline: () => void,
  onOffline: () => void,
}
```

Make sure to register the plugin by adding it to the index file `src/plugins/index.js`
