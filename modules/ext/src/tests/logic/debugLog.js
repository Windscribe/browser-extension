/* global constants, _, db, store */

const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = [
  {
    it: 'should save actions in the log',
    eval: async () => {
      store.dispatch({
        type: 'RANDOM_SETANDLOG',
        payload: { logActivity: 'RANDOM' },
      })

      await window.sleep(200)
      const logs = await db.WS_LOGS.toArray()

      return logs
    },
    assert: logs =>
      expect(logs, 'dispatched action was not found in log').to.satisfy(l =>
        l.some(x => x.activity === 'RANDOM'),
      ),
  },
  {
    it: 'should prune the logs when over the limit',
    eval: async () => {
      await db.WS_LOGS.clear()

      _.range(0, constants.LOGGER_CONFIG.maxEntries + 20).forEach(() => {
        store.dispatch({ type: 'RANDOM_ACTION' })
      })

      await window.sleep(1000)
      return [
        await window.db.WS_LOGS.count(),
        constants.LOGGER_CONFIG.maxEntries,
      ]
    },
    assert: ([count, maxEntries]) => {
      expect(
        count,
        'log has more than the max number of entries',
      ).to.be.lessThan(maxEntries)
    },
  },
  {
    it: 'should send debug logs to server ',
    eval: async () => {
      const debugLogRes = await new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
          const { debugLogReportResponse } = store.getState()
          if (debugLogReportResponse) {
            unsubscribe()
            resolve(debugLogReportResponse)
          }
        })
        store.dispatch(window.actions.debugLog.send())
      })
      return debugLogRes
    },
    assert: debugLog => {
      expect(debugLog.success, 'Expected debugLog.success to be 1').to.equal(1)
    },
  },
]
