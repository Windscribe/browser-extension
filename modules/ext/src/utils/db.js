import Dexie from 'dexie'
import { DB_NAME, DB_VERSION, IS_FIREFOX } from 'utils/constants'

const createDb = () => {
  const d = new Dexie(DB_NAME)

  d.version(DB_VERSION).stores({
    WS_STATE: 'reducer',
    WS_LOGS: '++id, [timestamp+activity]',
  })

  return d
}

let db = createDb()

export const initDb = async () => {
  try {
    const testDb = new Dexie('dummy')

    testDb.version(1).stores({
      dummyTest: '++id, value',
    })

    await testDb.dummyTest.put({ value: 'hello world' })

    // cleanup
    await testDb.close()
    await Dexie.delete('dummy')

    return true
  } catch (e) {
    if (
      e.message ===
        'InvalidStateError A mutation operation was attempted on a database that did not allow mutations.' &&
      IS_FIREFOX
    ) {
      Dexie.dependencies.indexedDB = require('fake-indexeddb')
      Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

      // reinit indexed db
      db = createDb()

      throw new Error('firefox-in-private-mode')
    } else {
      throw e
    }
  }
}

export const getDb = () => db
