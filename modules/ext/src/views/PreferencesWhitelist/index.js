import React, { useEffect, useReducer, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect, useDispatch } from 'ui/hooks'
import { Flex, Box, Text } from '@rebass/emotion'
import { css, ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { InlineButton } from 'ui/Button'
import { SettingHeader, SettingGroup, SettingItem } from 'components/Settings'
import SettingAlert from 'ui/Alert'
import AddIcon from 'assets/plus-icon.svg'
import WhitelistTray from './WhitelistTray'
import EntryList from './entryList'
import { Scrollbars } from 'react-custom-scrollbars'

import {
  Provider,
  configStateReducer,
  configStatesObj,
  domainStateObj,
  domainStateReducer,
  uiStatesObj,
  uiStateReducer,
} from './state'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.tabs,
  s => s.activeTabId,
  s => s.whitelist,
  (...args) => args,
)

const genEntityInWhitelist = (optionalWl = []) => ({
  whitelist = optionalWl,
  entity,
}) => !!whitelist.find(({ domain }) => domain === entity)

const entityInWhitelist = genEntityInWhitelist()

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [tabs, activeTabId, whitelist] = useConnect(selector)

  const shouldReloadPage = tabs[activeTabId]?.shouldReloadPage || false

  //for purposes of showing alert
  const viewContainerRef = useRef()

  // our 'current' domain
  useEffect(() => domainDispatch({ type: 'queryDomain' }), [whitelist])

  const [domainState, domainDispatch] = useReducer(
    domainStateReducer({ entityInWhitelist, whitelist }),
    {
      ...domainStateObj,
      domainObject: tabs[activeTabId],
    },
  )
  const [configState, configDispatch] = useReducer(
    useCallback(configStateReducer({ dispatch }), configStatesObj),
    [configStatesObj],
  )
  const [uiState, uiDispatch] = useReducer(
    uiStateReducer({ configDispatch }),
    uiStatesObj,
  )

  const { menuOpen } = uiState
  const mainTabIndex = menuOpen ? -1 : 0

  const domainTitle = domainState.domainValid
    ? domainState.currentSiteDomain
    : 'Invalid Domain'

  const alreadyWhitelisted = domainState.domainValid
    ? domainState.currentSiteDomainInWhitelist
    : true

  return (
    <div
      style={{ position: 'relative', background: colors.bg }}
      ref={viewContainerRef}
    >
      <Provider
        value={{
          state: { uiState, domainState, configState },
          dispatches: { uiDispatch, configDispatch, domainDispatch },
          actions: {
            entityInWhitelist,
            entityInExistingWhitelist: genEntityInWhitelist(whitelist), //we 'prepack' root whitelist here
          },
        }}
      >
        {viewContainerRef.current && (
          <SettingAlert
            content={
              <Text color={colors.white}>{t('Refresh to see changes')}</Text>
            }
            showing={shouldReloadPage}
            topOffset="21px"
            domNode={viewContainerRef.current}
            onClick={() => {
              browser.tabs.reload(activeTabId)
            }}
          />
        )}
        <WhitelistTray />
        <Flex flexDirection="column">
          <Box>
            <SettingHeader
              usePrimary
              prefName={t('Whitelist')}
              AdditionalIcon={AddIcon}
              additionalIconTip="Add New"
              additionalIconProps={{
                tabIndex: mainTabIndex,
                'aria-label': 'Add new whitelist entry',
              }}
              buttonProps={{
                tabIndex: mainTabIndex,
                background: colors.primary,
                onClick: () => {
                  uiDispatch({
                    type: 'setDeleteConfirm',
                    payload: {
                      confirmingDelete: false,
                      currentlyDeletingDomain: null,
                    },
                  })
                  uiDispatch({ type: 'addItem' })
                },
              }}
            />
          </Box>
          <Scrollbars
            autoHeight={true}
            autoHeightMin={324}
            autoHeightMax={336}
            renderThumbVertical={({ style, ...props }) => (
              <div
                {...props}
                style={{ ...style, backgroundColor: colors.scrollBar }}
              />
            )}
          >
            <Box mx={3}>
              <SettingGroup groupName={t('Current Page')}>
                <SettingItem
                  title={domainTitle}
                  disabled={alreadyWhitelisted}
                  ControlComponent={({ disabled = false }) => (
                    <InlineButton
                      tabIndex={mainTabIndex}
                      aria-label={t(`Add current page: {{parent}}`, {
                        parent: domainState.currentSiteDomain,
                      })}
                      solid
                      onClick={() => {
                        uiDispatch({
                          type: 'setDeleteConfirm',
                          payload: {
                            confirmingDelete: false,
                            currentlyDeletingDomain: null,
                          },
                        })
                        uiDispatch({
                          type: 'addCurrentPage',
                          payload: { newDomain: domainState.currentSiteDomain },
                        })
                      }}
                      disabled={disabled}
                    >
                      <AddIcon
                        css={css`
                          path {
                            fill: ${disabled
                              ? colors.inactive
                              : colors.primary};
                          }
                        `}
                      />
                    </InlineButton>
                  )}
                />
              </SettingGroup>
              <EntryList whitelist={whitelist} />
            </Box>
          </Scrollbars>
        </Flex>
      </Provider>
    </div>
  )
}
