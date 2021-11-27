# Server Credentials

Get the authentication credentials needed to connect to our exit nodes

### get

Get the server credentials for a user

#### Example

```javascript
/* Create your api instance */

const getCreds = () => apiInstance.serverCredentials.get()
  .then(credentials => /* Do things */)
  .catch(err => /* handle error */)

/* async/await */

const getCreds = async () => {
  try {
    const credentials = await apiInstance.serverCredentials.get()
    /* Do stuff with data */
  } catch (error) {
    /* handle error */
  }
}
```
