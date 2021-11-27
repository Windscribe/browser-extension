/* global store, constants, window */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should start polling when proxy is on',
    stringTemplate: true,
    eval: async () => {
      try {
        const customInterval = 500 // fast interval, we just need to ensure the session request is different
        await window.turnOffProxy()
        // session poller is already on at this point, but we turn it on again with new timestep
        window.store.dispatch(
          window.actions.sessionPoller({ interval: customInterval }),
        )
        // now we should have a non null last session request
        window.sleep(customInterval)
        await window.setLocation(constants.ENVS[window.ENV].TEST_LOCATION) // sets and also turns on...

        window.sleep(customInterval)

        const { lastSessionRequest: cachedSessionRequest } = store.getState()
        // poller should be active now
        if (!cachedSessionRequest) {
          // this means the poller failed to activate
          return false
        }

        const maxAttempts = 5
        // there is no guarantee that this interval will be in-sync with poller
        const response = new Promise(resolve => {
          let attempts = 0
          const intervalId = setInterval(() => {
            attempts++
            const { lastSessionRequest } = store.getState()
            if (cachedSessionRequest !== lastSessionRequest) {
              clearInterval(intervalId)
              return resolve(true)
            }
            if (attempts > maxAttempts) {
              clearInterval(intervalId)
              return resolve(false)
            }
          }, customInterval)
        })

        return await response
      } catch (e) {
        return JSON.stringify(e)
      }
    },
    assert: result => {
      expect(result, 'lastSessionRequest was never updated').to.be.true
    },
  },
  // {
  //   it: 'should stop the poller when the proxy turns off',
  //   eval: async () => {
  //     await window.turnOffProxy()
  //     let { session } = store.getState()

  //     if (!session.session_auth_hash) {
  //       await window.login(window.TEST_USER)
  //     }

  //     await window.setLocation(constants.ENVS[window.ENV].TEST_LOCATION)

  //     // let the poller run for a bit
  //     sleep((await globals.SESSION_POLLER_INTERVAL) * 2)

  //     await window.turnOffProxy()

  //     // just in case wait for any races to finish
  //     sleep((await globals.SESSION_POLLER_INTERVAL) * 2)

  //     let results = []
  //     let currentRound = 0
  //     let totalRounds = 5
  //     await new Promise(async resolve => {
  //       let id = setInterval(() => {
  //         results.push(store.getState().lastSessionRequest)
  //         currentRound++
  //         if (currentRound > totalRounds) {
  //           clearInterval(id)
  //           resolve()
  //         }
  //       }, await globals.SESSION_POLLER_INTERVAL)
  //     })

  //     return results
  //   },
  //   assert: results => {
  //     expect(
  //       results.length,
  //       `there should be multiple timestamps for this test to work`,
  //     ).to.be.greaterThan(1)

  //     expect(new Set(results).size).to.equal(1)
  //   },
  // },
]
