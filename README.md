# Windscribe Browser Extension
Source code of the Windscribe Chrome and Firefox browser extensions. This extension aims to improve user privacy by implementing the following features:

- Proxy browser data via the Windscribe network
- Block Ads, Trackers and Malware
- Block Social network widgets and buttons (Also considered trackers)
- Block website notification spam
- Remove 3rd Party Cookies
- Rotate the User-Agent
- Spoof Location data
- Spoof Timezone data
- Spoof Locale data
- Disable WebRTC
- Disable Javascript Service Workers


# Build Instructions

```
yarn cache clean && yarn install
yarn workspace ws-api-client build
yarn workspace ext build
```

Further documentations can be found [here](https://github.com/Windscribe/browser-extension/blob/main/modules/ext/docs/index.md):



# Attributions

All client side blocking functionality is courtesy of Raymond Hill's [uBlock project](https://github.com/gorhill/uBlock)

The blocklists used by the various blocking features are sourced from:

- https://github.com/uBlockOrigin/uAssets
- https://easylist.to
- https://curben.gitlab.io/malware-filter/urlhaus-filter.txt
- https://www.i-dont-care-about-cookies.eu/abp/