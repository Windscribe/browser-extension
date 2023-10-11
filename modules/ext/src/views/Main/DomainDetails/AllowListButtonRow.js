import React, {
  useEffect,
  useReducer,
  useContext,
  useRef,
  useLayoutEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect, useDispatch } from 'ui/hooks'
import { actions } from 'state/dux'
import { css, ThemeContext } from '@emotion/core'
import { Flex } from 'rebass'
import { startCase } from 'lodash'
import formatActiveTabInfo from 'plugins/tabs/format'
import ProxyNotSelected from 'assets/connection-deselected.svg'
import ProxySelected from 'assets/connection-selected.svg'
import AdsNotSelected from 'assets/ads-deselected.svg'
import AdsSelected from 'assets/ads-selected.svg'
import CookiesNotSelected from 'assets/cookies-deselected.svg'
import CloseIcon from 'assets/close-allowlist.svg'
import SmallRefreshIcon from 'assets/refresh.svg'
import CookiesSelected from 'assets/cookies-selected.svg'
import AllowListItem from './AllowListItem'
import { useTheme } from 'ui/hooks'
import { SimpleButton } from 'ui/Button'
import { DomainBarContext } from '.'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  s => s.allowlist,
  s => s.advancedModeEnabled,
  (...args) => args,
)

const defaultAllowlistData = {
  includeAllSubdomains: true,
  allowAds: false,
  allowCookies: false,
  allowDirectConnect: false,
}

export default () => {
  const { showingAllowlist, setShowingAllowlist } = useContext(DomainBarContext)

  const allowlistStateObj = {
    allowDirectConnect: false,
    allowAds: false,
    allowCookies: false,
  }

  const allowlistStateReducer = (state, action) => {
    const setKeyTo = key => ({ ...state, [key]: action.payload.to })
    switch (action.type) {
      case 'setDirectConnect': {
        return setKeyTo('allowDirectConnect')
      }
      case 'setAllowAds': {
        return setKeyTo('allowAds')
      }
      case 'setAllowCookies': {
        return setKeyTo('allowCookies')
      }
      default:
        return state
    }
  }

  const [allowlistState, allowlistDispatch] = useReducer(
    allowlistStateReducer,
    allowlistStateObj,
  )

  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [tabs, activeTabId, allowlist, advancedModeEnabled] = useConnect(
    selector,
  )

  const currentDomainInfo = formatActiveTabInfo(tabs[activeTabId])
  const currentAllowlistInfo = allowlist.find(
    x => x.domain === currentDomainInfo.hostname,
  )

  const shouldReload = tabs[activeTabId]?.shouldReloadPage || false

  const setOriginalAllowlistInfo = toWhat =>
    dispatch(actions.originalAllowlistInfo.set(toWhat))

  useEffect(() => {
    allowlistDispatch({
      type: 'setDirectConnect',
      payload: {
        to: currentAllowlistInfo?.allowDirectConnect,
      },
    })
    allowlistDispatch({
      type: 'setAllowAds',
      payload: {
        to: currentAllowlistInfo?.allowAds,
      },
    })
    allowlistDispatch({
      type: 'setAllowCookies',
      payload: {
        to: currentAllowlistInfo?.allowCookies,
      },
    })
  }, [currentAllowlistInfo])

  useEffect(() => {
    if (showingAllowlist) {
      setOriginalAllowlistInfo(
        currentAllowlistInfo || {
          ...defaultAllowlistData,
          domain: currentDomainInfo.hostname,
        },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingAllowlist])

  useLayoutEffect(() => {
    if (showingAllowlist) {
      setTimeout(() => {
        if (allowlistRowRef?.current?.style) {
          allowlistRowRef.current.style.pointerEvents = 'all'
          // give focus to first element
          firstItemRef.current.focus()
        }
      }, 500)
    } else {
      setTimeout(() => {
        if (allowlistRowRef?.current?.style) {
          allowlistRowRef.current.style.pointerEvents = 'none'
        }
      }, 0)
    }
  }, [showingAllowlist])

  const changeEntry = (key, value) => () => {
    if (currentAllowlistInfo) {
      const { allowDirectConnect, allowAds, allowCookies } = allowlistState
      // updating existent item
      const newConfigObject = {
        allowDirectConnect,
        allowAds,
        allowCookies,
        [key]: value,
      }

      // if all options negative, lets remove/delete this entry
      if (Object.values(newConfigObject).every(v => !v)) {
        return dispatch(
          actions.allowlist.pop({
            domain: currentAllowlistInfo.domain,
            logActivity: 'remove_allowlist_main_page',
          }),
        )
      }
      // otheriwse we just update
      return dispatch(
        actions.allowlist.update({
          allowlistObject: {
            ...currentAllowlistInfo,
            [key]: value,
          },
          logActivity: 'update_allowlist_main_page',
        }),
      )
    } else {
      //brand new item
      dispatch(
        actions.allowlist.save({
          allowlistObject: {
            ...defaultAllowlistData,
            domain: currentDomainInfo.hostname,
            [key]: value,
          },
          logActivity: 'save_allowlist_main_page',
        }),
      )
    }
  }

  const { colors } = useTheme(ThemeContext)
  const allowlistRowRef = useRef()
  const firstItemRef = useRef()

  return (
    <Flex
      ref={allowlistRowRef}
      css={css`
        pointer-events: none;
        transition: transform 0.4s ease;
        transform: translateX(${showingAllowlist ? 0 : 100}%);
        position: absolute;
        right: 0;
        background-color: ${colors.bg};
      `}
    >
      <Flex
        css={css`
          pointer-events: none;
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1),
            rgba(0, 0, 0, 0)
          );
          position: absolute;
          z-index: 10000;
          background-color: ${colors.bg};
          height: 50px;
          transform: rotate(180deg) translateX(100%);
          width: 100px;
          opacity: ${showingAllowlist ? 1 : 0};
          transition: opacity 0.2s ease;
        `}
      />
      <Flex ml="auto" mr={2}>
        <AllowListItem
          ref={firstItemRef}
          onClick={changeEntry(
            'allowDirectConnect',
            !allowlistState.allowDirectConnect,
          )}
          title={startCase(t('connection'))}
          selected={allowlistState.allowDirectConnect}
          Icon={
            allowlistState.allowDirectConnect ? ProxySelected : ProxyNotSelected
          }
        />

        {!advancedModeEnabled && (
          <AllowListItem
            onClick={changeEntry('allowAds', !allowlistState.allowAds)}
            title={startCase(t('ads'))}
            selected={allowlistState.allowAds}
            Icon={allowlistState.allowAds ? AdsSelected : AdsNotSelected}
          />
        )}
        <AllowListItem
          onClick={changeEntry('allowCookies', !allowlistState.allowCookies)}
          title={startCase(t('cookies'))}
          selected={allowlistState.allowCookies}
          Icon={
            allowlistState.allowCookies ? CookiesSelected : CookiesNotSelected
          }
        />
        <SimpleButton
          tabIndex={showingAllowlist ? 0 : -1}
          aria-label={`Allowlist Close ${shouldReload ? 'and Reload' : ''}`}
          px={2}
          py="12px"
          onClick={() => {
            if (shouldReload) {
              browser.tabs.reload(activeTabId).then(() => {
                setOriginalAllowlistInfo(
                  currentAllowlistInfo || {
                    ...defaultAllowlistData,
                    domain: currentDomainInfo.hostname,
                  },
                )
              })
            }
            setShowingAllowlist(false)
          }}
          css={css`
            display: flex;
            height: 50px;
            cursor: pointer;
          `}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            css={css`
              width: 24px;
              height: 24px;
              transition: all 0.2s ease;
              border-radius: 100%;
            `}
          >
            {shouldReload ? (
              <SmallRefreshIcon />
            ) : (
              <CloseIcon fill={colors.fgLight} />
            )}
          </Flex>
        </SimpleButton>
      </Flex>
    </Flex>
  )
}
