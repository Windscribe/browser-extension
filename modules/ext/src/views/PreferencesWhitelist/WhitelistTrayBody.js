import React, { useContext } from 'react'
import { useConnect } from 'ui/hooks'
import { css } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import Button, { SimpleButton } from 'ui/Button'
import { Box, Flex, Text } from '@rebass/emotion'
import { Menu, SaveButton, DeleteButton, MenuItem } from './styles'
import { SettingItem } from 'components/Settings'
import CheckIcon from 'assets/checkmark-icon.svg'
import LinkOutIcon from 'assets/external-link-icon.svg'
import { WebLink } from 'components/Button'
import Branch from 'ui/Branch'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

import { Context } from './state'

const ConfigItem = ({
  message,
  active,
  toggle,
  disabled = false,
  tabIndex = -1,
}) => {
  const { colors } = useTheme(ThemeContext)
  return (
    <MenuItem
      active={active}
      aria-pressed={active}
      tabIndex={tabIndex}
      onClick={() => !disabled && toggle()}
      pb={3}
      pt={4}
      pr={4}
      css={{
        transition: '0.3s',
        color: active ? colors.fg : colors.fgLight,
        cursor: 'pointer',
        ':hover': {
          color: colors.fg,
        },
      }}
    >
      <Box
        css={css`
          .text {
            text-align: left;
          }
        `}
        flex={1}
      >
        <Text className="text" fontWeight={700} fontSize={1}>
          {message}
        </Text>
      </Box>
      {disabled ? (
        <WebLink aria-label={message} onClick={toggle}>
          <LinkOutIcon
            css={css`
              path {
                fill: ${colors.fgLight};
              }
            `}
          />
        </WebLink>
      ) : (
        <CheckIcon fill={active ? colors.primary : colors.inactive} />
      )}
    </MenuItem>
  )
}

export default ({ trayTabIndex }) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const WhitelistContext = useContext(Context)
  const advancedModeEnabled = useConnect(s => s.advancedModeEnabled)

  const { confirmingDelete, mode, canSave } = WhitelistContext.state.uiState

  const {
    allowDirectConnect,
    allowAds,
    allowCookies,
    includeAllSubdomains,
  } = WhitelistContext.state.configState

  const { configDispatch, uiDispatch } = WhitelistContext.dispatches

  const saveValid = [!allowDirectConnect, !allowAds, !allowCookies]

  const closeMenu = () => {
    // 'clean up' our elusive state
    configDispatch({ type: 'reset' })
    uiDispatch({
      type: 'closeMenu',
    })
  }

  return (
    <>
      <Box
        pl={3}
        onClick={e => e.stopPropagation()}
        css={css`
          background-color: ${colors.nanowhite};
          .setting-heading {
            color: ${colors.white};
          }
        `}
      >
        <SettingItem
          noBorder
          tabIndex={trayTabIndex}
          aria-label={t('Apply to all subdomains')}
          title={t('Apply to all subdomains')}
          checked={!!includeAllSubdomains}
          onChange={() =>
            configDispatch({ type: 'toggleIncludeAllSubdomains' })
          }
          css={{ marginRight: '16px' }}
        />
      </Box>

      <Box
        css={css`
          background-color: ${colors.bg};
        `}
      >
        <Menu onClick={e => e.stopPropagation()} ml={4}>
          <ConfigItem
            tabIndex={trayTabIndex}
            message={t('Allow Connection')}
            active={allowDirectConnect}
            toggle={() => configDispatch({ type: 'toggleAllowDirectConnect' })}
          />
          <ConfigItem
            tabIndex={advancedModeEnabled ? -1 : trayTabIndex}
            message={t('Allow Ads')}
            active={allowAds}
            toggle={
              advancedModeEnabled
                ? () => browser.tabs.create({ url: 'options-ui/index.html' })
                : () => configDispatch({ type: 'toggleAllowAds' })
            }
            disabled={advancedModeEnabled}
          />
          <ConfigItem
            tabIndex={trayTabIndex}
            message={t('Allow Cookies')}
            active={allowCookies}
            toggle={() => configDispatch({ type: 'toggleAllowCookies' })}
          />

          <Flex
            alignItems="center"
            justifyContent="space-around"
            flexDirection="column"
            py={3}
            pr={3}
          >
            <Flex
              alignItems="center"
              css={css`
                width: 100%;
              `}
            >
              <Branch
                if={confirmingDelete}
                Then={() => (
                  <>
                    <Box flex={1}>
                      <Text
                        aria-live="polite"
                        tabIndex={trayTabIndex}
                        fontSize={1}
                        color={colors.fg}
                      >
                        {t('Are you sure?')}
                      </Text>
                    </Box>
                    <SimpleButton
                      tabIndex={trayTabIndex}
                      aria-label="Yes, remove whitelist entry"
                      onClick={() => {
                        configDispatch({ type: 'removeWhitelistEntry' })
                        closeMenu()
                      }}
                    >
                      <Text color={colors.red} fontSize={1}>
                        {t('Yes')}
                      </Text>
                    </SimpleButton>
                    <SimpleButton
                      aria-label="No, do not remove whitelist entry"
                      tabIndex={trayTabIndex}
                      onClick={() =>
                        uiDispatch({
                          type: 'setDeleteConfirm',
                          payload: { confirmingDelete: false },
                        })
                      }
                    >
                      <Text color={colors.primary} fontSize={1}>
                        {t('No')}
                      </Text>
                    </SimpleButton>
                  </>
                )}
                Else={() => (
                  <>
                    <Button
                      tabIndex={trayTabIndex}
                      aria-label="Cancel"
                      onClick={closeMenu}
                      css={css`
                        width: 50%;
                        border-color: ${colors.fgLight} !important;
                        color: ${colors.fg} !important;
                        &:hover {
                          background-color: transparent !important;
                          border-color: ${colors.fg} !important;
                        }
                      `}
                      lg
                    >
                      {t('Cancel')}
                    </Button>
                    <Branch
                      if={saveValid.every(e => e) && mode === 'edit'}
                      Then={() => (
                        <DeleteButton
                          tabIndex={trayTabIndex}
                          aria-label="Delete whitelist entry"
                          primary
                          lg
                          onClick={() => {
                            uiDispatch({
                              type: 'setDeleteConfirm',
                              payload: { confirmingDelete: true },
                            })
                          }}
                        >
                          {t('Delete')}
                        </DeleteButton>
                      )}
                      Else={() => (
                        <SaveButton
                          aria-label={
                            mode === 'edit'
                              ? t('Save whitelist entry')
                              : t('Add new whitelist entry')
                          }
                          tabIndex={trayTabIndex}
                          primary
                          lg
                          disabled={saveValid.every(e => e) || !canSave}
                          onClick={() => {
                            if (mode === 'edit') {
                              configDispatch({ type: 'updateWhitelistEntry' })
                            } else {
                              configDispatch({ type: 'saveWhitelistEntry' })
                            }
                            closeMenu()
                          }}
                        >
                          {mode === 'edit' ? t('Save') : t('Add')}
                        </SaveButton>
                      )}
                    />
                  </>
                )}
              />
            </Flex>
          </Flex>
        </Menu>
      </Box>
    </>
  )
}
