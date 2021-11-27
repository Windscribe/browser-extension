# PAC

### get

Get a pac file for a targeted browser. it takes 1 argument which is browser target.

You can either supply `firefox` or `chrome` however if no value is supplied it will default to `chrome`

#### Example

```javascript
/* ... Create your api instance with a session auth hash */

/* promises */
const getChromePac = () => apiInstance.pac.get()
  .then(parsedPacFile => /* Do something */)
  .catch(err => /* do something */)

const getFireFoxPac = () => apiInstance.pac.get('firefox')
  .then(parsedPac => /* ... */)
  .catch(err => /* ... */)


/* async/await */
const getChromePac = async () => {
  try {
    const parsedPacFile = await apiInstance.pac.get()
    /* Do your pac file stuff */
  } catch (e) {
    /* handle error */
  }

}
```
