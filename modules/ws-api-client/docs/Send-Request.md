# Send Request

`sendRequest` is the ajax function that is used to interface with Windscribe's api by default. However it can be used to interface with any other api by providing it an `http` address

It is built upon the `fetch` standard and supports all its api options.

`sendRequest` handles params by itself as well.

`sendRequest` takes 3 arguments. `endpoint`, `options`, and `method`

if You haven't used fetch before: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

| Argument   | Description                                              | Default Value |
| ---------- | :------------------------------------------------------- | ------------- |
| `endpoint` | An api endpoint or a url                                 | `none`        |
| `options`  | An extension on the base fetch config. Supports `params` | `{}`          |
| `method`   | The http method                                          | `get`         |

Keep in mind `sendRequest` will return you a base fetch response when it resolves, it's up to you handle it.

However it will reject if the response is considered `not ok` which you can consider any http codes that is considered an error

### Example usage with the windscribe api

```javascript
import { sendRequest } from 'ws-api-client'

/*
  Goes to whatever your API_URL environment variable is set to and appends `/Ping` to it
  Let's say your enviroment is set to `api.windscribe.com` your request will look like this:

  https://api.windscribe.com/Ping
*/
sendRequest('/Ping')
  .then(response => /* standard fetch response */)
  .catch(errorResponse => /* fetch error object */)
```

### Example with windscribe api with params

```javascript
import { sendRequest } from 'ws-api-client'

const options = {
  params: {
    hello: 'world',
    some: 'params'
  }
}

/*
  The data in options.params will be consumed and be appended to the url as a query string
  So it'll come out looking like:

  <your-api-url>?key="value"&another_key="value" etc
*/
sendRequest('/Ping', options)
```

### Making post/other method requests

```javascript
import { sendRequest } from 'ws-api-client'

const options = {
  /* ... your configuration */
  body: {...} // if you need to send a request body
}

/*
  The data in options.params will be consumed and be appended to the url as a query string
  So it'll come out looking like:

  <your-api-url>?key="value"&another_key="value" etc
*/
sendRequest('/Ping', options, 'POST') /* the method on the end defines the http method. All http methods work */
```

### Example with a non api url

```javascript
import { sendRequest } from 'ws-api-client'

/* You can do all the same things as above however you're now fetching from a different origin */
sendRequest('https://jsonplaceholder.com/posts', options)
```
