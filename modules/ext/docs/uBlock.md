# Embedding and Building uBlock

The uBlock extension is embedded into Windscribe as if the extension was a normal uBlock build. All the regular uBlock build files and assets are placed into the distributed assets as they would normally appear in an official uBlock build.

The main differences are that the `popup.html`, `background.html` and  `manifest.json` are removed entirely.

All assets that are loaded from the removed `background.html`, must be copied over to the windscribe version of `background.html`, and any content script or permissions defined in the uBlock `manifest.json` must also be accounted for in the Windscribe `manifest.json`. While the removal of the uBlock versions are handled at build time by the `/modules/ext/scripts/ublock/pull-ublock.js` script, making sure we are loading the correct assets is done manually.

The version of uBlock that is built and embedded is defined in `/modules/ext/package.json`. The `uBlockVersion` field is the branch name that is cloned, build and bundled into the extension.

We maintain a fork of uBlock on github, but try to keep the changes to a minimum so that there is less work to keep in sync with upstream changes.

https://github.com/Windscribe/uBlock



# Updating uBlock

The current convention is to download the latest tagged release of uBlock from the original github repo: https://github.com/gorhill/uBlock and drop it into a branch in our fork, naming the branch after the uBlock version, i.e. `ws-v1.40.4`

The key changes that are required as of `v1.40.4` are:

- Update the document blocked message at `src/_locales/en/messages.json` to say "Windscribe" to avoid user confusion
- Comment out chrome api overriting at `platform/common/vapi.js`, ie: https://github.com/Windscribe/uBlock/commit/71767abc2273f97b81bc76823a730d8b4492807a#diff-3757195e1d07b3c4c436935c011810a84bc37d195af0b3cb7bca588c88940c53
- Comment out the extension icon updates performed by uBlock at `src/js/tab.js`, ie: https://github.com/Windscribe/uBlock/commit/71767abc2273f97b81bc76823a730d8b4492807a#diff-7370f0926ce8910f2c71660ffa846f43f1e74f943fcd70ea464485b5b7a4cf1b

It is possible that future uBlock version will have many more breaking changes, especially when uBlock moves to manifest v3, so looking through the uBlock changelog is important prior to updating.

Once the new branch has been pushed to github, update the `uBlockVersion` field in `/modules/ext/package.json`

**IMPORTANT** make sure to delete the local `/public/ublock` directory after updating the `uBlockVersion` field.

### Some post update validation

- Are blocklists being respected
- Does toggling blocklists still work. Use `µBlock.availableFilterLists` or `µBlock.selectedFilterLists` in background console to validate.
- Does the windscribe extension icon change upon activating DOM/Network level blocks
- Are all lists returned by the Windscribe API being fetched when inspecting the Network tab in developer console
- When enabling Advanced mode, does the uBlock Setting/Options UI work
- General developer console errors or warnings 
