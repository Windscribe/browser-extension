import darkTheme from 'ui/themes/ext.theme.dark'
import DarkThemeIcon from 'assets/dark-theme.svg'
import lightTheme from 'ui/themes/ext.theme.light'
import LightThemeIcon from 'assets/light-theme.svg'
//import communistTheme from 'ui/themes/ext.theme.communist'

export const IS_FIREFOX =
  !process.env.NODE && navigator.userAgent.includes('Firefox')
export const IS_CHROME =
  !process.env.NODE && navigator.userAgent.includes('Chrome')

export const LOCAL_SERVER_RESPONSE = 'hey hey hey'
export const CLIENT_AUTH_SECRET = '952b4412f002315aa50751032fcaab03'
export const FILTER = { urls: ['<all_urls>'] }

export const ENVS = {
  STG: {
    API_URL: 'https://api-staging.windscribe.com',
    ASSETS_URL: 'https://assets-staging.windscribe.com',
    ROOT_URL: 'https://www-staging.windscribe.com',
    TEST_LOCATION: {
      name: 'Toronto',
      nickname: 'Skydome',
      countryCode: 'UK',
      hosts: ['stg-be-301.staticnetcontent.com'],
    },
  },
  PROD: {
    API_URL: 'https://api.windscribe.com',
    ASSETS_URL: 'https://assets.windscribe.com',
    BACKUP_API_URL: 'https://api.staticnetcontent.com',
    BACKUP_ASSETS_URL: 'https://assets.staticnetcontent.com',
    ROOT_URL: 'https://www.windscribe.com',
    TEST_LOCATION: {
      locationId: 7,
      countryCode: 'CA',
      dataCenterId: 158,
      name: 'Toronto',
      nickname: 'Weedhaven',
      isCenterPro: 0,
      isDatacenter: true,
      gps: '43.59,-79.76',
      timezone: 'America/Toronto',
      hosts: [
        'ca-010.whiskergalaxy.com',
        'ca-011.whiskergalaxy.com',
        'ca-015.whiskergalaxy.com',
      ],
    },
  },
}

// used for user agent setting (do not want user to assume different platform)
export const platforms = ['Windows', 'Macintosh', 'Linux']

//TODO: reference this map whereever hard numbers are being referenced
export const BILLING_PLAN_ID = {
  A_LA_CARTE_UNLIMITED: -9,
}

export const EMAIL = {
  VERIFIED: 1,
  UNCONFIRMED: 0,
}

export const ACCOUNT_STATES = {
  ACTIVE: 1,
  EXPIRED: 2,
  BANNED: 3,
}

export const LOCATION_STATUS = {
  ACTIVE: 1,
  DOWN: 2,
}

export const ACCOUNT_PLAN = {
  FREE: 0,
  PREMIUM: 1,
  UNLIMITED: -1,
}

export const THEME_MAP = new Map([
  ['dark', { index: 0, theme: darkTheme, icon: DarkThemeIcon }],
  ['light', { index: 1, theme: lightTheme, icon: LightThemeIcon }],
  //['communist', { index: 2, theme: communistTheme, icon: LightThemeIcon }],
])

export const SESSION_ERRORS = {
  COULD_NOT_CREATE_USER_SESSION: 700, //"400::Could not create user session"
  SESSION_INVALID: 701, //"403::Submitted session is invalid. Please re-log in"
  COULD_NOT_LOGIN: 702, //"403::Could not log in with provided credentials"
  COULD_NOT_LOGIN_CONSECUTIVE: 703, //"403::Could not log in with provided credentials. Too many consecutive login failures."
  SESSION_EXPIRED: 704, //"403::Session has expired."
  NOT_AVAILIBLE: 705, //"403::Not avaialble for this connection type."
  USER_SUSPENDED: 706, //403::User has status of suspended, action no permitted."
  IP_SUSPENDED: 707, //403::Suspicious activity detected from your network. Please try again soon."
  NO_AUTH_HASH: 1337,
}

export const ERROR_REFETCH_THRESHOLD = 3
export const ERROR_KILL_THRESHOLD = 10

export const SYNC_KEY = 'WS_DATA_'
export const DB_NAME = 'WS_EXT_DB'
export const DB_VERSION = 1

export const LOGGER_CONFIG = {
  logLevels: ['INFO', 'DEBUG', 'ERROR'],
  blacklist: [],
  maxEntries: +process.env.WEB_EXT_LOGGER_MAX_ENTRIES || 500,
}

// TODO: set this in plugin
export const REDUCERS_TO_SYNC = [
  'view',
  'expiredUsername',
  'userStashes',
  'originalUserStashState',
  'session',
  'firstTimeUser',
  'serverList',
  'serverCredentials',
  'cruiseControlDomains',
  'currentLocation',
  'currentOS',
  'cruiseControlList',
  'proxy',
  'whitelist',
  'blockLists',
  'lastDebugLogCheck',
  'lastBlockListCheck',
  'lastNewsfeedCheck',
  'blockListsEnabled',
  'newsfeedIdsAlreadyViewed',
  'userAgent',
  'favoriteLocations',
  'bestLocation',
  'splitPersonalityEnabled',
  'allowSystemNotifications',
  'autoConnect',
  'proxyPort',
  'smokewall',
  'failover',
  'userAgent',
  'webRTCEnabled',
  'locationSpooferEnabled',
  'proxyTimeEnabled',
  'proxyDiscovered',
  'advancedModeEnabled',
  'cookieMonsterEnabled',
  'cookieMonsterOnlyThirdParty',
  'notificationBlockerEnabled',
  'showRateUs',
  'neverRateAgain',
  'showNewsfeed',
  'rateUsSnoozedOnDate',
  'rateUsSnoozed',
  'firstInstallDate',
  'locationSorting',
  'missingUserFilter',
  'theme',
  'showDebugContextMenu',
  'workerBlockEnabled',
  'languageSwitchEnabled',
  'privacyOptionsCount',
  'ublockEnabled',
  'ublockAsked',
  'locationLoadEnabled',
]

// all of our used languages are here, name transforms to iso key as per isoLanguagesList.js
export const ACTIVE_LANGUAGES_MAP = {
  english: 'en',
  french: 'fr',
  arabic: 'ar',
  chinese: 'zh',
}

// extra whitelist rules for specific domains (to ensure proper whitelisting)
export const WHITELIST_DOMAIN_TABLE = {
  'youtube.com': ['googlevideo.com'],
  'www.youtube.com': ['googlevideo.com'],
  'netflix.com': ['nflxvideo.net'],
  'www.netflix.com': ['nflxvideo.net'],
}

// TODO: set this in plugin
export const DO_NOT_CLEAR_ON_LOGOUT = [
  'expiredUsername',
  'userStashes',
  'bgReady',
]

export const SESSION_POLLER_INTERVAL =
  +process.env.WEB_EXT_SESSION_POLLER_INTERVAL || 600000 // 10 minute

export const SHOW_COLLAPSE_ALL_BTN = false

export const COOKIE_MONSTER_ENABLED =
  process.env.WEB_EXT_COOKIE_MONSTER_ENABLED || false

export const GLOBAL_ERROR_LOG = process.env.WEB_EXT_GLOBAL_ERROR_LOG || true

export const I18N_DEBUG = !!process.env.WEB_EXT_I18N_DEBUG

export const AUTH_ERROR_COUNT_MAX =
  process.env.WEB_EXT_AUTH_ERROR_COUNT_MAX || 50

export const AUTH_RESET_MIN_INTERVAL =
  process.env.WEB_EXT_AUTH_RESET_MIN_INTERVAL || 5000

export const RENDER_TIMEOUT = process.env.WEB_EXT_RENDER_TIMEOUT || 5000

export const PROXY_PORT = process.env.WEB_EXT_PROXY_PORT || '443'

export const API_CALL_MIN_INTERVAL =
  process.env.WEB_EXT_API_CALL_MIN_INTERVAL || 1000
