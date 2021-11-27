# How Background plugins work.

Each plugin in the extension is comprised of several components.

- Managing redux state
- Handling extension events
- Storing business logic

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
  // If you are responding to a message you must use the `resolve` or `reject` methods passed down in the second arg
  onMessage: {
    messageType(message, { sender, resolve, reject }) =>
      Promise | undefined,
  },
  // internet connectivity events
  onOnline: () => void,
  onOffline: () => void,
}
```

Make sure to register the plugin by adding it to the index file `src/plugins/index.js`
