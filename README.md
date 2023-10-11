# Windscribe Browser Extension
Source code of the Windscribe Chrome and Firefox browser extensions. This extension aims to improve user privacy by implementing the following features:

- Proxy data via the Windscribe network
- Block Ads, Trackers and Malware (powered by [uBlock Origin](https://github.com/gorhill/uBlock))
- Block Social network widgets and buttons
- Block website notification spam
- Remove 1st/3rd Party Cookies on tab close
- Rotate User-Agent
- Spoof Browser Location API
- Spoof Timezone
- Spoof Locale
- Disable WebRTC
- Disable Javascript Service Workers

# Build Instructions

```
yarn cache clean && yarn install
cd modules/ext && cp .env.schema .env
yarn workspace ws-api-client build
yarn workspace ext build
```

Further documentations can be found [here](https://github.com/Windscribe/browser-extension/blob/main/modules/ext/docs/index.md):

# Attributions

All client side blocking functionality is courtesy of Raymond Hill's [uBlock Origin project](https://github.com/gorhill/uBlock)

The blocklists used by the various blocking features are sourced from:

- https://github.com/uBlockOrigin/uAssets
- https://easylist.to
- https://gitlab.com/curben/urlhaus-filter
- https://www.i-dont-care-about-cookies.eu/