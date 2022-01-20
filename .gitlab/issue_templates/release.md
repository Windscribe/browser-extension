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
