# Lexicon, and all things state management

For state management we use `redux` along with `webext-redux` to facilitate passing state between the `background` and `popup`. We created a set of default redux actions that every reducer has access to and can be used to modify state without creating custom actions.

For the frontend we use `react-redux's` `useSelector` and `useDispatch` hooks for connecting to state and dispatching actions.

## Location

If you navigate to `src/state`, you can find all initial redux boilerplate, custom middlewares for the debug log & indexedDB persistance and the scaffolding for creating our standard actions.

## How our action scaffolding works

The scaffolding system works by taking a list of verbs and setting them to configure state. You can find all verbs in `src/state/verbs.js` (**note that not all verbs modify state. Some are simply placeholder**) each string is appended to every reducer and will modify that reducers state.

You can find which verbs modify state in `src/state/scaffold.js`. Some verbs may not modify any state, we usually use those for `redux-logic` actions.

## The `actions` object

The actions object is an object of reducer action creators

```
  {
    ...
    reducerName: {...verbs}
  }
```

You can use these action creators like so:

```javascript
import { actions } from "state";

// Your code
dispatch(actions.yourReducer.yourVerb(payload));
// eg
dispatch(actions.view.set("Greeting"));
```

## action creators under the hood

If you aren't able to use the action creators themselves. The default verbs share a similar format.

Each action type can roughly translate like this: `actions.yourReducer.yourVerb` -> `yourreducer_YOURVERB`

So if you are calling this: `actions.view.set("Greeting")`

It will return this: `{type: "view_SET", payload: "Greeting"}`

## Adding a new reducer

Adding a new reducer is fairly simple. Navigate to a plugin in `src/plugins` and the plugin index should have a `lexiconEntries` array. Simply add a new object with a `name` to get started.

## Configuring your lexicon entry

Each lexicon entry uses a configuration object.

```javascript
{
  name: string, // name of your reducer
  initialState: any, // The initial state of your reducer.  If no state is defined it defaults to: { error: null, loading: false }
  stashOnLogout: false, // Indicates whether or not the state should be persisted after logout
}
```

Make your reducer persistent add the reducers name to the `REDUCERS_TO_SYNC` constant found in `src/utils/constants.js`.

## Considerations when passing state between background and popup

### Data compatibility

As was mentioned in the start of this page, the extension uses `webext-redux` to enable state to be passed between the `popup` and `background` pages. Under the hood, `webext-redux` used the [WebExtension messaging interface](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage) This is not without its caveats. For example the messaging system cannot support `Functions` they will be transformed into strings. It's recommended to only send data that adheres [to the structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) to limit the amount of issues that may be caused.

### Keeping the popup in sync with the background

Due to the nature of how state works in the extension. You **cannot** import the redux store into your component and dispatch.
You should use `react-redux`'s `connect` higher order function or the `useDispatch` hook.

If you do use the redux store directly from the popup then it will bypass the messaging system `webext-redux` uses to keep track of what state has changed.
