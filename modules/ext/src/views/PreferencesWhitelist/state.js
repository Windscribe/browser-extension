import { createContext } from 'react'
import { actions } from 'state'
import formatActiveTabInfo from 'plugins/tabs/format'

const Context = createContext()

const { Consumer, Provider } = Context

export { Consumer, Provider, Context }

//these are set when you hit 'edit' on a list item [from Entrylist.js]
export const configStatesObj = {
  /* Configuration states */
  domain: '', //the domain you see when you open the tray
  allowDirectConnect: false,
  allowAds: false,
  allowCookies: false,
  includeAllSubdomains: true,
}

// The options you see when you have the tray open
export const configStateReducer = ({ dispatch }) => (state, action) => {
  switch (action.type) {
    case 'setConfigData': {
      const { itemData } = action.payload
      return { ...state, ...itemData }
    }
    case 'setNewDomain': {
      const { newDomain } = action.payload
      return {
        ...state,
        domain: newDomain,
      }
    }
    case 'saveWhitelistEntry': {
      return dispatch(
        actions.whitelist.save({
          whitelistObject: state,
          logActivity: 'save_whitelist_prefs_page',
        }),
      )
    }
    case 'updateWhitelistEntry': {
      return dispatch(
        actions.whitelist.update({
          whitelistObject: state,
          logActivity: 'update_whitelist_prefs_page',
        }),
      )
    }
    case 'removeWhitelistEntry':
      // you can provide your own entry, otherwise it will flush whatever is in state
      const { entry = state } = action.payload || {}
      return dispatch(
        actions.whitelist.pop({
          domain: entry.domain,
          logActivity: 'remove_whitelist_prefs_page',
        }),
      )
    case 'toggleAllowDirectConnect':
      return { ...state, allowDirectConnect: !state.allowDirectConnect }
    case 'toggleAllowAds':
      return { ...state, allowAds: !state.allowAds }
    case 'toggleAllowCookies':
      return { ...state, allowCookies: !state.allowCookies }
    case 'toggleIncludeAllSubdomains':
      return { ...state, includeAllSubdomains: !state.includeAllSubdomains }

    case 'reset':
      return configStatesObj

    default:
      return state
  }
}

export const domainStateObj = {
  /* Queried domain states */
  currentSiteDomain: null,
  currentSiteDomainInWhitelist: false,
  domainValid: false,
  domainInWhitelist: false, // should only be changed on input
}
export const domainStateReducer = ({ entityInWhitelist, whitelist }) => (
  state,
  action,
) => {
  switch (action.type) {
    case 'queryDomain': {
      //get information on a domain (used when editing list item)
      const { hostname, hostnameInvalid } = formatActiveTabInfo(
        state.domainObject,
      )
      return {
        ...state,
        currentSiteDomain: hostname,
        domainValid: !hostnameInvalid,
        currentSiteDomainInWhitelist: entityInWhitelist({
          whitelist,
          entity: hostname,
        }),
      }
    }
    default:
      return state
  }
}

export const uiStatesObj = {
  /* Ui states */
  menuOpen: false,
  mode: null,
  confirmingDelete: false,
  currentlyDeletingDomain: '', //keep track of current deletion item [for the list]
  canSave: true, //if its a valid domain and you made changes
}
export const uiStateReducer = ({ configDispatch }) => (state, action) => {
  switch (action.type) {
    case 'closeMenu':
      return uiStatesObj
    case 'addItem':
      return { ...state, menuOpen: true, mode: 'add' }
    case 'addCurrentPage':
      //only when you tick the + icon
      const { newDomain } = action.payload
      configDispatch({ type: 'setNewDomain', payload: { newDomain } })
      return { ...state, menuOpen: true, mode: 'addCur' }
    case 'editItem': {
      // provided by the list item itself
      const { itemData } = action.payload
      //set it so we can see our 'ticked' selections
      configDispatch({
        type: 'setConfigData',
        payload: { itemData },
      })
      return { ...state, menuOpen: true, mode: 'edit' }
    }
    case 'setDeleteConfirm': {
      const {
        confirmingDelete,
        currentlyDeletingDomain = null,
      } = action.payload
      return { ...state, confirmingDelete, currentlyDeletingDomain }
    }
    case 'setCanSave': {
      const { canSave } = action.payload
      return { ...state, canSave }
    }
    default:
      return state
  }
}
