# Session

### post

Create a user session which returns a promise with user data.

It takes 2 arguments, username and password

**This method doesn't require a session auth hash**

#### Example

```javascript
import wsApiClient from 'ws-api-client'

/* Initialize an instance */
const config = {
  sessionType: /* Your session type */
}

const apiInstance = wsApiClient(config)


// With promise chain
const login = () =>
  apiInstance.session.post('username', 'password')
    .then(userData => /* Is an Object: handle your user data */)
    .catch(err => /* Is an Object: Handle your error */)

// async/await

const login = async () => {
  try {
    const userData = await apiInstance.session.post('username', 'password')

    /* Do whatever */
  } catch (error) {
    /* Handle your error */
  }
}
```

### get

Gets user data according to the session auth hash provided.

#### Example

```javascript
import wsApiClient from 'ws-api-client'

/* Initialize an instance */
const config = {
  sessionAuthHash: /* Users session auth hash */
  sessionType: /* Your session type */
}

const apiInstance = wsApiClient(config)


// With promise chain
const getUserData = () =>
  apiInstance.session.get()
    .then(userData => /* Is an Object: handle your user data */)
    .catch(err => /* Is an Object: Handle your error */)

// async/await

const getUserData = async () => {
  try {
    const userData = await apiInstance.session.get()
    /* Do whatever */
  } catch (error) {
    /* Handle your error */
  }
}
```
