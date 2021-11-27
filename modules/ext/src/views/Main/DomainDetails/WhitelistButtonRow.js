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
import CloseIcon from 'assets/close-whitelist.svg'
import SmallRefreshIcon from 'assets/refresh.svg'
import CookiesSelected from 'assets/cookies-selected.svg'
import WhiteListItem from './WhitelistItem'
import { useTheme } from 'ui/hooks'
import { SimpleButton } from 'ui/Button'
import { DomainBarContext } from './'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  s => s.whitelist,
  s => s.advancedModeEnabled,
  (...args) => args,
)

const defaultWhitelistData = {
  includeAllSubdomains: true,
  allowAds: false,
  allowCookies: false,
  allowDirectConnect: false,
}

export default () => {
  const { showingWhitelist, setShowingWhitelist } = useContext(DomainBarContext)

  const whitelistStateObj = {
    allowDirectConnect: false,
    allowAds: false,
    allowCookies: false,
  }

  const whitelistStateReducer = (state, action) => {
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

  const [whitelistState, whitelistDispatch] = useReducer(
    whitelistStateReducer,
    whitelistStateObj,
  )

  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [tabs, activeTabId, whitelist, advancedModeEnabled] = useConnect(
    selector,
  )

  const currentDomainInfo = formatActiveTabInfo(tabs[activeTabId])
  const currentWhitelistInfo = whitelist.find(
    x => x.domain === currentDomainInfo.hostname,
  )

  const shouldReload = tabs[activeTabId]?.shouldReloadPage || false

  const setOriginalWhitelistInfo = toWhat =>
    dispatch(actions.originalWhitelistInfo.set(toWhat))

  useEffect(() => {
    whitelistDispatch({
      type: 'setDirectConnect',
      payload: {
        to: currentWhitelistInfo?.allowDirectConnect,
      },
    })
    whitelistDispatch({
      type: 'setAllowAds',
      payload: {
        to: currentWhitelistInfo?.allowAds,
      },
    })
    whitelistDispatch({
      type: 'setAllowCookies',
      payload: {
        to: currentWhitelistInfo?.allowCookies,
      },
    })
  }, [currentWhitelistInfo])

  useEffect(() => {
    if (showingWhitelist) {
      setOriginalWhitelistInfo(
        currentWhitelistInfo || {
          ...defaultWhitelistData,
          domain: currentDomainInfo.hostname,
        },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingWhitelist])

  useLayoutEffect(() => {
    if (showingWhitelist) {
      setTimeout(() => {
        if (whitelistRowRef?.current?.style) {
          whitelistRowRef.current.style.pointerEvents = 'all'
          // give focus to first element
          firstItemRef.current.focus()
        }
      }, 500)
    } else {
      setTimeout(() => {
        if (whitelistRowRef?.current?.style) {
          whitelistRowRef.current.style.pointerEvents = 'none'
        }
      }, 0)
    }
  }, [showingWhitelist])

  const changeEntry = (key, value) => () => {
    if (currentWhitelistInfo) {
      const { allowDirectConnect, allowAds, allowCookies } = whitelistState
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
          actions.whitelist.pop({
            domain: currentWhitelistInfo.domain,
            logActivity: 'remove_whitelist_main_page',
          }),
        )
      }
      // otheriwse we just update
      return dispatch(
        actions.whitelist.update({
          whitelistObject: {
            ...currentWhitelistInfo,
            [key]: value,
          },
          logActivity: 'update_whitelist_main_page',
        }),
      )
    } else {
      //brand new item
      dispatch(
        actions.whitelist.save({
          whitelistObject: {
            ...defaultWhitelistData,
            domain: currentDomainInfo.hostname,
            [key]: value,
          },
          logActivity: 'save_whitelist_main_page',
        }),
      )
    }
  }

  const { colors } = useTheme(ThemeContext)
  const whitelistRowRef = useRef()
  const firstItemRef = useRef()

  return (
    <Flex
      ref={whitelistRowRef}
      css={css`
        pointer-events: none;
        transition: transform 0.4s ease;
        transform: translateX(${showingWhitelist ? 0 : 100}%);
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
          opacity: ${showingWhitelist ? 1 : 0};
          transition: opacity 0.2s ease;
        `}
      />
      <Flex ml="auto" mr={2}>
        <WhiteListItem
          ref={firstItemRef}
          onClick={changeEntry(
            'allowDirectConnect',
            !whitelistState.allowDirectConnect,
          )}
          title={startCase(t('connection'))}
          selected={whitelistState.allowDirectConnect}
          Icon={
            whitelistState.allowDirectConnect ? ProxySelected : ProxyNotSelected
          }
        />

        {!advancedModeEnabled && (
          <WhiteListItem
            onClick={changeEntry('allowAds', !whitelistState.allowAds)}
            title={startCase(t('ads'))}
            selected={whitelistState.allowAds}
            Icon={whitelistState.allowAds ? AdsSelected : AdsNotSelected}
          />
        )}
        <WhiteListItem
          onClick={changeEntry('allowCookies', !whitelistState.allowCookies)}
          title={startCase(t('cookies'))}
          selected={whitelistState.allowCookies}
          Icon={
            whitelistState.allowCookies ? CookiesSelected : CookiesNotSelected
          }
        />
        <SimpleButton
          tabIndex={showingWhitelist ? 0 : -1}
          aria-label={`Whitelist Close ${shouldReload ? 'and Reload' : ''}`}
          px={2}
          py="12px"
          onClick={() => {
            if (shouldReload) {
              browser.tabs.reload(activeTabId).then(() => {
                setOriginalWhitelistInfo(
                  currentWhitelistInfo || {
                    ...defaultWhitelistData,
                    domain: currentDomainInfo.hostname,
                  },
                )
              })
            }
            setShowingWhitelist(false)
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
