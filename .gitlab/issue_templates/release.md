# Windscribe Browser Extension Release Checklist

- [ ] Check previous tags and/or browser stores for latest version number
- [ ] Create a branch for this new version, i.e. `release-v3.5.0` with effort put into following SemVer best practices
- [ ] Modify the `manifest.json` and `package.json` to reflect new version within release branch
- [ ] Move all issue items slated for this release into the `ToDo` column
- [ ] Work through board issues, testing and validating locally
- [ ] Once issues have been completed, check uBlock for updates: https://gitlab.int.windscribe.com/ws/client/extension/-/blob/master/modules/ext/docs/uBlock.md
- [ ] Drop both Firefox and Chrome builds into the `#qa` Slack channel and provide a changelog composed of links to the completed issues. For easy build identification, we use the. suffix convention of `rc1`, `rc2` for denoting the builds posted to `#qa`
- [ ] Review and fix any QA reported issues and resubmit to `#qa` channel. Issues can be skipped if they are not related to this release and are already present in production
- [ ] If all issues resolved, merge the release branch into `master` and create a new tag ie `v3.5.0` with proper release notes

## Chrome Web Store Submission

This will include steps for actual submission to chrome web store in the future.

- [ ] provide @yegor with an archive file of the `chrome` build directory

## Firefox Web Store Submission

This will include steps for actual submission to firefox web store in the future.

- [ ] Download the newly created tag from gitlab (do not use your local dev environment)
- [ ] Run the Firefox build instructions
- [ ] create an archive of `/modules/ext/build/firefox`, but make sure just the contents are in the archive, not the folder itself.
- [ ] provide both the tagged source files ie `firefox-extension-source-v3.5.0.zip` and the built extension `firefox-extension-v3.5.0.zip` to @yegor for submission, along with a copy of the build instructions

### Firefox build instructions

```
requirements:
- node v15.4.0+
- yarn v1.16.0+

Build steps
1) extract zip
2) cd extension-v3.5.0
3) yarn cache clean && yarn install
4) yarn workspace ws-api-client build
5) yarn workspace ext build-ff

The build out will be in: extension-v3.5.0/modules/ext/build/firefox
```

## Sync Github Open Source Version

We must keep the open source version of the extension in sync with each public release

repo: https://github.com/Windscribe/browser-extension

- [ ] checkout `master` from public repo
- [ ] overwrite all files and push to github
- [ ] tag a release with a matching version and changelog (no need to reference gitlab issue numbers, just issue descriptions)

## Full QA Checklist

Note: Keep the Dev Console open in the background and watch for any console errors. Any and all Console errors must be reported as bugs.

## 1. Update checks

Update from the previous version and verify that:

- [ ] General settings are retained.
- [ ] Blocker settings are retained.
- [ ] Privacy settings are retained.
- [ ] Allowlist is retained.
      ​
      ​

## 2. Full Browser Shutdown & Restart

- [ ] General settings are retained.
- [ ] Blocker settings are retained.
- [ ] Privacy settings are retained.
- [ ] Allowlist is retained.
      ​

## 3. Server List Updates

Server List should update when:

- [ ] Account status changes.
- [ ] loc_hash changes.
- [ ] Pro status changes.
- [ ] ALC changes.
- [ ] If new list does not contain current connect location, move up the location tree and fallback to Auto-Pilot.
      ​

## 4. Feature / Functionality Checks

- ### General:
- [ ] Auto-connect works.
- [ ] Notifications work.
- [ ] Smokewall works. - Use General > Debug Log to figure out proxy hostnames for a location. Then block said hostnames using the hosts file or using ROBERT. For example, for Chennai - Adyar, search for "proxy location: Chennai hosts:" in the Debug Log. FYI, hostnames for Chennai are "in-005.whiskergalaxy.com", "in-006.whiskergalaxy.com", and "in-007.whiskergalaxy.com". :)
- ### Blocker:
- [ ] Ad-blocker works.
- - [ ] YouTube loads + ads blocked.
- - [ ] popads.net blocked (toggling Ad Crusher should unblock).
- - [ ] Ad Crusher not breaking popular websites: load Reddit, bbc.co.uk, Wikipedia, Twitter, Amazon, [Yahoo Finance](https://finance.yahoo.com/quote/JNJ) etc.
- [ ] Tracker blocker works. Test on [nordvpn.com](https://nordvpn.com/) or [surfshark.com](https://surfshark.com/) heh.
- [ ] Malware blocker works. [Test here](https://free-softs.drtrcherbs.in).
- [ ] Social network widget blocker works. [Test here](http://wp.social-media-buttons-test.previewized.com/).
- [ ] "We use cookies" blocker works. Test on [nordvpn.com](https://nordvpn.com/).
- [ ] Advanced mode works - check if custom lists can be added, etc.
- ### Privacy:
- [ ] Cookie Monster works. Test on Bing. Perform a search, open a new tab and note how the search query persist. Close both tabs and visit Bing again. The search term must now not persist.
- [ ] Notification Blocker works. Test using [HTML5 Web Notifications](https://www.bennish.net/web-notifications.html).
- [ ] WebRTC Slayer works. [Test here](https://browserleaks.com/webrtc).
- [ ] Location Warp works. [Test here](https://browserleaks.com/javascript).
- [ ] Time Warp works. [Test here](https://browserleaks.com/javascript).
- [ ] Language Warp works. [Test here](https://browserleaks.com/javascript).
- [ ] User Agent Rotater works. [Test here](https://browserleaks.com/javascript).
- [ ] Worker Blocker works. [Test here](https://z0ccc.github.io/LocateJS/).
- ### Account:
- [ ] Edit Account works.
- [ ] E-mail linking to account works.
- ### Allowlist:
- [ ] Adding to Allowlist works.
- [ ] Editing element in Allowlist works.
- [ ] Removing from Allowlist works.
      ​

## 5. UX Tests:

- [ ] "Sign up" redirects to relevant locations on the website.
- [ ] "Forgot Password" works.
- [ ] Alphabetical / Geographical Location toggle works.
- [ ] Theme change works.
- [ ] Upgrade behaviour.
- [ ] Downgrade behaviour.
- [ ] Out of Data behaviour.
- - [ ] Upon reset after out of data, new creds are fetched upon repeated auth errors.
- [ ] Browser start with proxy enabled. Have tabs open, do a restart (normal / hard), make sure one is not asked for authentication.
- [ ] Backup API works. Test with background.html + Network. Make sure it fails over to another. hostnames = api.windscribe.com, api.staticnetcontent.com, api.whiskergalaxy.com, api.totallyacdn.com
- [ ] Double Hop Detection works.
- [ ] Auto-Pilot works.
- [ ] Favorites
- - [ ] Adding locations to favorites works.
- - [ ] Removing locations from favorites works.
- - [ ] Favorites are saved between restarts.
- - [ ] Connecting to favorite location works (and IP changes).
        ​

## 6. Other Tests:

- [ ] General UI glitches
- - [ ] View persistence.
- - [ ] Fonts.
- [ ] Extension errors
- - [ ] DevTools (background.html)
