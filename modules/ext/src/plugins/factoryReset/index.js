import { getDb } from 'utils/db'

export default {
  logic: () => [
    {
      type: 'RESET_ALL',
      latest: true,
      async process(_, dispatch, done) {
        const db = getDb()
        try {
          await db.WS_LOGS.clear()
          await db.WS_STATE.clear()
          await browser.proxy.settings.clear({}, done)
          await browser.runtime.reload()
        } catch (e) {
          console.error('DEXIE ERROR', e)
        }
      },
    },
  ],
}
