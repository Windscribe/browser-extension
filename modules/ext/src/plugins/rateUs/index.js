import { store, actions } from 'state'
import { differenceInDays } from 'date-fns'

const SHOW_AFTER_GB_USED = 2 // maximum usage allowed until you see popup
const SHOW_AFTER_INSTALLED_DAYS = 3 // number of days from install to show popup
const SHOW_AFTER_SNOOZE_DAYS = 7 // number of days from snoozed date to show popup

export default {
  lexiconEntries: [
    {
      name: 'showRateUs', // triggered automatically after 3 days AND >2b usage
      initialState: false,
      stash: true,
    },
    {
      name: 'rateUsSnoozedOnDate', // date of when you specified intent to snooze
      initialState: null,
      stash: true,
    },
    {
      name: 'firstInstallDate',
      initialState: null,
      stash: true,
    },
    {
      name: 'rateUsSnoozed',
      initialState: false,
      stash: true,
    },
    {
      name: 'neverRateAgain',
      initialState: false,
      stash: true,
    },
  ],

  initialize() {
    // for when app is first installed
    if (!store.getState().firstInstallDate) {
      const oldExtDataString = localStorage.getItem('wsextension_userInfo')
      if (!oldExtDataString) {
        store.dispatch(actions.firstInstallDate.set(Date.now()))
      }
    }
  },
  // once you see the modal, you will never see it again, unless you specify the 'not now' action
  logic: actions => [
    {
      type: actions.showRateUs.set,
      latest: true,
      transform({ getState, action }, allow, reject) {
        const shouldShow = action.payload
        const {
          session,
          firstInstallDate,
          showRateUs,
          rateUsSnoozedOnDate,
          neverRateAgain,
        } = getState()

        if (!shouldShow) {
          return reject()
        }

        if (neverRateAgain) {
          return reject()
        }

        // this means you must have seen the modal and hit 'not now'
        if (rateUsSnoozedOnDate) {
          const daysSinceSnoozeIntent = differenceInDays(
            Date.now(),
            rateUsSnoozedOnDate,
          )

          if (daysSinceSnoozeIntent >= SHOW_AFTER_SNOOZE_DAYS) {
            return allow(actions.showRateUs.set(true))
          }
        }

        if (showRateUs) {
          // it was already shown, no need to proceed
          return reject()
        }

        // we only show if usage is greater than 2gb and its been more than 3 days

        // if usage is greater than 2gb
        const gbUsed = session.traffic_used / Math.pow(1024, 3)
        // accuracy of rounded num is not crucial (floating point cutoff)
        const gbUsedRounded = Math.round(gbUsed * 100) / 100

        const exceededUsage = gbUsedRounded >= SHOW_AFTER_GB_USED

        if (exceededUsage) {
          if (!firstInstallDate) {
            // this could occur when you are login to other user account
            store.dispatch(actions.firstInstallDate.set(Date.now()))
            return reject()
          }
          const daysSinceInstall = differenceInDays(
            Date.now(),
            firstInstallDate,
          )
          if (daysSinceInstall >= SHOW_AFTER_INSTALLED_DAYS) {
            return allow(actions.showRateUs.set(true))
          }
        }

        reject()
      },
      process({ action, getState }, dispatch, done) {
        const { rateUsSnoozed } = getState()
        const shouldShow = action.payload
        if (shouldShow) {
          if (rateUsSnoozed === true) {
            dispatch(actions.view.set('RateUsAgain'))
          } else {
            dispatch(actions.view.set('RateUs'))
            dispatch(actions.rateUsSnoozed.set(true))
          }
        }
        done()
      },
    },
  ],
}
