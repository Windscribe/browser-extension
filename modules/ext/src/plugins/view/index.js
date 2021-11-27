import { THEME_MAP } from 'utils/constants'
import setPopupHeight from './setPopupHeight'

export default {
  lexiconEntries: [
    {
      name: 'view',
      initialState: {
        previous: [],
        current: 'SplashPage',
      },
      resolvers: {
        SET: (state, action) => ({
          // probably not going back more than 3 times
          // can always increase later if necessary
          previous: [...state.previous.slice(-3), state.current],
          current: action.payload,
        }),
        BACK: state => ({
          previous: state.previous.slice(0, state.previous.length - 1),
          current: state.previous[state.previous.length - 1],
        }),
      },
    },
    {
      name: 'bgReady',
      initialState: false,
    },
    {
      name: 'showOnboarding',
      initialState: false,
    },
    {
      name: 'popupHeight',
      initialState: '300px',
    },
    {
      name: 'theme',
      initialState: [...THEME_MAP.keys()][0],
      stashOnLogout: true,
    },
  ],
  logic: actions => [
    setPopupHeight(actions),
    {
      type: 'POPUP_UNMOUNT',
      process({ getState }, dispatch, done) {
        const { session, showOnboarding } = getState()
        if (session?.session_auth_hash) {
          if (showOnboarding) {
            dispatch(actions.showOnboarding.set(false))
          }
        }
        done()
      },
    },
    {
      type: actions.theme.next,
      latest: true,
      async process({ getState }, dispatch, done) {
        const themeName = getState().theme
        const currentThemeIndex = THEME_MAP.get(themeName).index
        const nextThemeIndex = (currentThemeIndex + 1) % THEME_MAP.size
        const updatedThemeName = [...THEME_MAP.keys()][nextThemeIndex]
        dispatch(actions.theme.set(updatedThemeName))
        done()
      },
    },
  ],
}
