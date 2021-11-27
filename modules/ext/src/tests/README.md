# Testing

## What we use

[Mocha](https://mochajs.org/)

[Chai](https://www.chaijs.com/)

[Puppeteer](https://developers.google.com/web/tools/puppeteer/) [for end to end testing]

## Running Tests

To run the entire testing suite

    yarn workspace ext test

To run just the logic tests

    yarn workspace ext test:logic

To run just the end to end tests

    yarn workspace ext test:e2e

It is recommended that you run the entire suite, much like it's done in the Gitlab pipeline

## Overview

`puppeteer` load files in the `build` folder. Make sure you have started the extension.

### Setup

`modules/ext/src/tests/setup.js` is the first relevant thing that runs in a development build. It is called in `background.js`.

It attaches functions and variables to the `background` page of the application.

`setup.js` has lots of helpers like `checkIp`, `store`, `actions` and even custom functions such as `setLocation` or `logout`. Each of these are predominately used in `logic` tests.

We can gain default access to these items in our custom `eval` method. This is explained below.

### Entry Point

When you run any of the test commands, `modules/ext/automated_tests/chrome.tests.js` is where all the magic happens.

You might have noticed the `chrome` prefix, in the future we plan to provide support for running tests on both chrome and firefox.

Each test is run synchronously, and fed from the `logic` and `e2e` folders. Those folders provide an index file that outputs an array of objects (aggregated from sibling files). An entry within that array can have a shape like :

```js
export default {
    // This is not used now, since all of the tests are chrome anyways
    target: String,

    // Should describe the test in a meaningful way
    it: String,

    // before is run in the popup (foreground), and is needed for tests that
    // manipulate state before any sort of evaluation. See admin tests for examples.
    before?: async () => void,

    // eval is run in the background page. It cannot access the DOM,
    // but has access to items we added in setup.js (as explained above)
    // we always pass this testUser in, as some tests require access to it
    eval?: async ({ testUser?: Object }) => any, // anything we want to assert

    // run is in the context of the page we are on (for our tests, we refer to it as popup)
    // you pass in the current page, and then we can run puppeteer methods on it
    // run is usually reserved for end to end testing
    run?: async (popup:<Page>) => any,

    // for any of the tests, do I want a snapshot [png] of the current page?
    snapshot?: Boolean,

    // assert tests the results of whatever came back from either eval or run (before is exempt)
    // assert is where you can use Chai to evaluate things.
    // A failure will output the expected and actual result of the test
    assert: (whatToAssert:any) => void,
}
```

### Logic Tests

In `modules/ext/src/tests/logic` reside all tests that interact with the application programmatically. These tests look for functionality, along with correct results after actions are dispatched. They follow a strict order.

For example, `createUser` _must_ come before `auth`. Since all `auth` tests rely on login information supplied by `createUser`.

`eval` is heavily used in these tests.

Our custom `eval` operates in the extensions `background` page. Recall, we called `setup.js` in our background script.

```js
const backgroundPageTarget = targets.find(
  target => target.type() === "background_page"
);
bgPage = await backgroundPageTarget.page();
```

Gets used

```js
const evalRes = await bgPage.evaluate(t.eval, {
  testUser: global.TEST_USER
});
```

### Evaluate?

`evaluate` is a puppeteer method that runs a function inside of whatever context page you provide. It stringifies the function too, expect async calls to [**fail**](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#code-transpilation-issues_) in some contexts.

We are also passing in a `testUser` in `eval`, this is because eval does not have access to global variables that reside in the foreground context.

### End to End Tests

In `modules/ext/src/tests/e2e` are all tests that focus on user interaction. These do things such as clicking / typing / submitting/ querying the UI. Much like logic tests, they are _even_ more strict in order. The entire suite runs like how a user would naturally go through the application.

`run` is heavily used in these tests.

`run` is evaluated in our `popup.html` context. Now, this can be _any_ page that is currently open ala puppeteer, but for our purposes, e2e tests rely on a detached view of the popup that was instantiated at the start. This allows us to interact with our extension within a page.

<sup>1</sup> Sometimes we need access to state within `run`. Each run call gets passed in the popup.html context. Unlike `eval` we are not running the `evaluate` function on the popup. We pass `popup` in so we can run all puppeteer commands on it, and also evaluate things, for instance our `getState` helpers help us pull out `store.getState` from the popup.

Note: We do NOT get access to `setup` instantiated methods. We have `store` because it is attached to window in `modules/ext/src/popup/load.js`.

### Admin

The `modules/ext/src/tests/admin` folder is not a suite of independent tests, but rather, a place where other suites cherrypick its various admin tests.

Some tests here are a combination of evaluations that run on both the foreground (popup) and background page.

For example `downgradeTestUser` first calls `before`. This is run in the foreground, and we can call the adminApi functions in that context.

It performs an action that has no return value. In this instance we downgrade a user to the 50mb plan.

Afterwards, `eval` is called because we need to assert results that require use of `store`. Remember, store was attached to the background, and therefore accessible.

- No need to do window.store, we define store as a global variable at the top of the file

Finally we have asserted that indeed, the current state should have a `billing_plan_id` of `-7`.

### Context Chart

| Foreground           | Background |
| :------------------- | :--------: |
| Before ()            |   Eval()   |
| Run ()<sup>\*1</sup> |

<sub>Note that much of this is subject to change</sub>
