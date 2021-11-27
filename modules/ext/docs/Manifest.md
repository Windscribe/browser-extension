# Manifest

**[Make sure to read more about the webextensions manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)**

We have 4 manifest files that get merged together to create a full manifest when webpack runs. You can find these manifests located in `public/manifest`.

Note, merging is done automatically by `react-scripts`

## base.json

The initial manifest that webpack uses as a baseline.

## dev.json

This adds/overwrites `base.json` file in `development` environments. Does not run in prod

## chrome.json

Adds/overwrites `base.json` when building specifically for `chrome`

## firefox.json

Adds/overwrites `base.json` when building specifically for `firefox`
