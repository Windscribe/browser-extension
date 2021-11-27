# Feedback needed

# Usage

**Requires a node version of `8.9.2` or higher**

* Clone the repo
* run `npm install` or `yarn`
* run `npm run build` to build the project

## **Hold on. THIS LIBRARY REQUIRES ENVIRONMENT VARIABLES TO FUNCTION!**

This library was written with the expectation that you'll use environment variables in your project.

You can set these variables in your project's environment, this library doesn't need to be configured in that sense it will consume the variables from the project it's been imported into.

### Required variables

#### `API_URL` The default url the library will utilize.

#### `CLIENT_AUTH_SECRET` The secret that is needed for authentication

### You can check the way `.env.testing` file is used. If you need a reference

# Getting started

Import the lib and create a new api instance. The api instance takes a configuration object in order to be utilized.

```javascript
  import wsApiClient from 'ws-api-client'

  const config = {
    sessionAuthHash: 'The users session auth hash' //If you're not making requests that require a session auth hash you can safely omit this entry.,
    sessionType: 1 //Must be a number related to the applications session type

  }

  const apiInstance = wsApiClient(config)
```

You can now either export that instance and use it in the entire app or really whatever you want to do with it.

The `sendRequest` method is also exposed and can be imported as well if you need to interface with the api directly

```javascript
import { sendRequest } from 'ws-api-client'
```

Note all methods return a promise

## Api

The api is split into relevant objects and methods under that

### Read the api objects:

#### [Session](docs/Session.md)

#### [PAC](docs/PAC.md)

#### [Server Credentials](docs/Server-Credentials.md)

#### [Send Request](docs/Send-Request.md)

## Contributing

If you want to contribute to the library it will require a node version of `8.9.2` or higher

* Clone the repo
* Install your dependencies with `npm install` or `yarn`
* Run the compiler with `npm start` it'll watch for changes and compile
* Write a test for your new method and then code (or whatever way works for you)
* Then run `npm run test` to run all tests. Or `npm run test:watch` if you want tests to run on code change
* Send a PR with your work!
