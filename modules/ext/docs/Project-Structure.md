# Before getting started

**I highly recommend reading the [Anatomy of an extension by Mozilla](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension)**.

It will give you a high level overview on how extensions are structured.

# Ext project structure

This document will include details on the codebase. Ideally you can use this as a reference to help you get acclimated with the codebase. Each top level folder will be broken into its own section. Each section will be divided by headings. Each heading name will be a folder name or file name.

Root files won't be covered very closely here. You may want to check [Working-with-envs](./Working-with-envs.md), [Configuring-react-scripts](./Configuring-react-scripts.md)

<!-- AUTOMATED_TESTS -->
<details>
<summary>automated_tests</summary>
Contains the initialization of the puppeteer tests as well as ouputs from the test runner. (Traces, screenshots etc)

## screenshots

Contains screenshots of the popup, taken by E2E tests.

## traces

Contains process traces in a json file

## debugLog.text

An output of the extensions debug log during the lifecycle of the tests

</details>

<!-- END OF AUTOMATED_TESTS -->

<!-- BUILD -->
<details>
  <summary>build</summary>
  The output of the development/prod builds. The output of the prod builds include a directory per supported platform (firefox and chrome) each contains a build of the extension.  If building dev there's only 1 set of builds.

**Do keep note that most of the files/directories are from µBlock** I will be outlining only the files and directories that belong to us.

## content-scripts

All our content scripts we move from `public`

## fonts

Contains fonts we bundled with the ext

## static

Contains our application bundles.

## background.html

The background's index

## popup.html

The popup's index

</details>
<!-- END OF BUILD -->

<!-- DIST -->
<details>
<summary>dist</summary>
(For development only)
Includes built artifacts. Contains zips/xpi's of the prod extension
</details>

<details>
<summary>public</summary>

For all static(ish) views/components of the extension that don't live in the same context as either the popup or background

## content-scripts

Contains all application content scripts. These will be injected into every respective webpage the user navigates to. Please note the files prepended with `test` are NOT loaded in prod.

## debug-log-viewer

A real time view of the debug log

## fonts

All fonts we bundle into the ext

## icons

Includes toolbar icons, favicons etc

## manifest

includes JSON files to generate a `manifest.json` file depending on a context [see Manifest.md](./Manifest.md) for more insight into each .json file

## options-ui

Contains a view/logic for `advancedMode`. Basically it exposes µBlock origins internal options page.

## ublock

Contains the codebase for our forked µBlock Origin extension. This will automatically download, build and move itself. You shouldn't need to worry about this much unless you need to fiddle around with µBO's source.

</details>
<!-- END OF DIST -->

<!-- SCRIPTS -->
<details>
<summary>scripts</summary>

Includes automation scripts

## deployment

Includes all logic related to our automated deployments.

## ublock

Includes all logic related to automating the building of µBlock origin

</details>
<!-- END OF SCRIPTS -->

<!-- SRC DIR INFO -->
<details>
<summary>src</summary>

The source code for the entire code base.

## assets

Includes all static assets for the ext. Some are sorted into their own folders, however the majority of the assets are located in the root

## browser_events

Contains code related to watching web extension events and piping those events to plugins [See Plugin-Architecture.md](Plugin-Architecture.md)

## components

Shared react components used across views.

## dev

This folder contains `dev-window` files that inject functionality for development. These files are only injected into the dev window, NOT the popup.

## i18n

Contains the loading mechanism for importing translations into the extension

## lib

Contains open source libraries that are not managed by our package manager

## plugins

The main point where all background logic is housed. Each plugin encapsulates state management, biz logic, and event handling for a subset of features. For example if you wanted to find the relevant logic the web proxy, you would check the `proxy` plugin. You can read me on plugins [here](./Plugin-Architecture.md)

## popup

Contains the initial stages of the extension's frontend. This directory contains the initialization logic for the frontend, plus global error handling and relevant views for said error handling

## state

Includes our redux store, and scaffolding logic. [You can refer to State-Management.md](./State-Management.md) for more details on how redux is used in the context of our ext

## styles

Contains styling helpers and the theme file. It may be handy to check out [styled-system](https://styled-system.com/) and [rebass](https://rebassjs.org/theming/) to get an idea of how themeing works in our frontend

## tests

Houses all E2E and integration tests for the extension. You can read more about them [here](../src/tests/README.md)

## utils

Shared functional util functions used across the popup and background

## views

All 'routes' for the ext. Each view dir contains a root index and may contain its own assets, components, utils, etc. If the component/util etc is **not** shared outside of the view we tend to keep them coupled inside that respective views directory.

## api.js

Simply a single instance of our api client. This is used throughout the application to interface with Windscribe's api

## background.js

The main entry point for the background process. Includes checks and init logic for the background.

## popup.js

The main entry point for the popup process. Includes checks and init logic for the popup.

## Router.js

The routing component for the popup.

</details>
<!-- END OF SRC DIR INFO -->

<!-- STORIES -->

stories isn't really used. Can be considered deprecated.

<!-- END OF STORIES -->
