import { pick, isEqual, omit } from 'lodash'
import { Base64 } from 'js-base64'
import { getDb } from 'utils/db'
import api from 'api'
import { LOGGER_CONFIG } from 'utils/constants'
import { differenceInMinutes, format } from 'date-fns'
import pushToDebugLog from 'utils/debugLogger'

import {
  isRequired,
  userStateKeysMap,
  constructDebugLog,
  generateLogHeader,
} from './utils'

let previousLogItem = null
const MAX_MINS_BETWEEN_REPEATED_LOGS = 10

export default actions => [
  {
    type: actions.debugLog.push,
    latest: true,
    async transform(_, allow) {
      const db = getDb()
      // check if we exceeded number of allowable items in db
      try {
        const count = await db.WS_LOGS.count()

        if (count >= LOGGER_CONFIG.maxEntries) {
          // perform a 'rolling' delete of items at head of db
          const firstItemInDb = await db.WS_LOGS.toCollection().first()
          try {
            await db.WS_LOGS.where('[timestamp+activity]')
              .equals([firstItemInDb.timestamp, firstItemInDb.activity])
              .delete()
          } catch (e) {
            console.error(e)
          }
        }
      } catch (e) {
        console.error('DEXIE ERROR', e)
      }

      allow()
    },
    async process({ action }, dispatch, done) {
      const db = getDb()
      const {
        timestamp = isRequired('timestamp'),
        tag = isRequired('tag'),
        level = isRequired('level'),
        activity = isRequired('activity'),
        message = isRequired('message'),
      } = action?.payload || {}
      // check argument consistency
      if (!LOGGER_CONFIG.logLevels.includes(level)) {
        console.warn(
          `Incorrect log level specified, expected one of ${LOGGER_CONFIG.logLevels}, got ${level}`,
        )
        return done()
      }

      const logToAdd = {
        timestamp,
        tag,
        level,
        activity,
        message,
      }

      if (previousLogItem) {
        // we have a previous log
        // compare it and this one, except the always different timestamp key
        const prevLogItemNoTimestamp = omit(previousLogItem, ['timestamp'])
        const logToAddNoTimestamp = omit(logToAdd, ['timestamp'])
        if (isEqual(prevLogItemNoTimestamp, logToAddNoTimestamp)) {
          // previous item is the same as current
          // no need to add it to db, we just manipulate previous db entry's msg
          const lastDbLog = await db.WS_LOGS.toCollection().last()
          // one more defensive check to see if all items are matched
          if (
            isEqual(
              omit(lastDbLog, ['timestamp', 'id', 'repeatCount']),
              logToAddNoTimestamp,
            )
          ) {
            // we now know that our current log is exactly the same the previous db entry
            // modify last entry, only if the time elapsed between entries is > delta
            const prevCurrLogDiffMins = differenceInMinutes(
              format(logToAdd.timestamp),
              format(lastDbLog.timestamp),
            )

            if (prevCurrLogDiffMins < MAX_MINS_BETWEEN_REPEATED_LOGS) {
              let repeatCount = lastDbLog?.repeatCount || 1
              // increment last logs repeat count
              await db.WS_LOGS.update(lastDbLog.id, {
                repeatCount: ++repeatCount,
              })
              return done()
            }
          }
        } else {
          previousLogItem = { ...logToAdd }
        }
      } else {
        //store log in-case next one is the same
        previousLogItem = { ...logToAdd }
      }

      // add item to db
      try {
        await db.WS_LOGS.add(logToAdd)
      } catch (err) {
        console.error('Failed to log', err)
      }
      done()
    },
  },
  {
    type: actions.debugLog.send,
    latest: true,
    async process({ getState, action }, dispatch, done) {
      const db = getDb()
      const { logActivity } = action?.payload || {}
      const {
        currentOS,
        session,
        originalUserStashState,
        userAgent,
      } = getState()

      const [logHeader, parsedLogs] = await Promise.all([
        generateLogHeader({
          currentOS,
          originalUserStashState,
          originalUserAgent: userAgent.original,
        }),
        constructDebugLog(),
      ])

      const debugLog = logHeader + '\n' + parsedLogs
      try {
        const response = await api.post({
          endpoint: '/Report/applog',
          params: {
            // If using BTOA it says -> Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.
            logfile: Base64.encode(debugLog),
            username: session.username,
          },
        })
        dispatch(actions.debugLogReportResponse.set(response.data))
        // delete entire table, no need for it now
        await db.WS_LOGS.clear()
        // store the state as it is now
        const currentStashableState = pick(getState(), userStateKeysMap)
        dispatch(actions.originalUserStashState.set(currentStashableState))
        pushToDebugLog({
          activity: logActivity,
          message: 'Sent a debug log',
        })
        done()
      } catch (err) {
        console.error(err)
        dispatch(actions.debugLogReportResponse.set(err))
        pushToDebugLog({
          activity: logActivity,
          level: 'ERROR',
          message: `Error while sending debug log: ${err}`,
        })
      }
      done()
    },
  },
  {
    type: actions.debugLog.togglecontextmenu,
    latest: true,
    async process({ getState }, dispatch, done) {
      const logActivity = 'debugLog'

      const { showDebugContextMenu } = getState()

      const newValue = !showDebugContextMenu

      pushToDebugLog({
        activity: logActivity,
        message: `Toggling debug context menu from ${showDebugContextMenu} to ${newValue}`,
      })

      try {
        if (newValue) {
          browser.contextMenus.create({
            id: 'view-debug-log',
            title: 'View Debug Log',
            contexts: ['all'],
          })
        } else {
          browser.contextMenus.removeAll()
        }
        dispatch(actions.showDebugContextMenu.set(newValue))
        done()
      } catch (err) {
        pushToDebugLog({
          activity: logActivity,
          level: 'ERROR',
          message: `Error while trying to toggle debug context menu: ${err}`,
        })
        console.error(err)
      }
      done()
    },
  },
  {
    type: actions.debugLog.clearweeklongentries,
    latest: true,
    async process({ action }, dispatch, done) {
      const db = getDb()
      const { logActivity } = action?.payload || {}

      try {
        const weekInMilliseconds = 604800000
        await db.WS_LOGS.where('[timestamp+activity]')
          .below([Date.now() - weekInMilliseconds, -Infinity])
          .delete()
        pushToDebugLog({
          activity: logActivity,
          message: 'Successfully cleared logs older than 1 week',
        })
        done()
      } catch (err) {
        pushToDebugLog({
          activity: logActivity,
          level: 'ERROR',
          message: `Error while trying to clear logs older than 1 week: ${err}`,
        })
        console.error(err)
      }
      done()
    },
  },
]
