import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Context } from './state'
import { SettingGroup, SettingItem } from 'components/Settings'
import { ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { Flex, Text } from '@rebass/emotion'
import EditIcon from 'assets/edit-icon.svg'
import GarbageIcon from 'assets/garbage-icon.svg'
import Tooltip from 'ui/Tooltip'
import Branch from 'ui/Branch'
import { ActionButton } from './styles'
import { SimpleButton } from 'ui/Button'

const EntryList = ({ allowlist }) => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const AllowlistContext = useContext(Context)
  const {
    confirmingDelete,
    currentlyDeletingDomain,
    menuOpen,
  } = AllowlistContext.state.uiState
  const { uiDispatch, configDispatch } = AllowlistContext.dispatches
  const entryListTabIndex = menuOpen ? -1 : 0
  return (
    <SettingGroup groupName={t('Allowlisted')} padding={0}>
      {allowlist.map((itemData, i) => {
        return (
          <Branch
            key={itemData.domain + i}
            if={confirmingDelete && currentlyDeletingDomain === itemData.domain}
            Then={() => (
              <SettingItem
                noBorder={i === allowlist.length - 1}
                aria-live="assertive"
                title={t('Are you sure?')}
                ControlComponent={() => (
                  <Flex justifyContent="space-around">
                    <SimpleButton
                      aria-label={t(
                        `Yes, remove allowlist entry for: {{parent}}`,
                        {
                          parent: itemData.domain,
                        },
                      )}
                      tabIndex={entryListTabIndex}
                      onClick={() =>
                        configDispatch({
                          type: 'removeAllowlistEntry',
                          payload: { entry: itemData },
                        })
                      }
                    >
                      <Text fontSize={1} color={'red'}>
                        {t('Yes')}
                      </Text>
                    </SimpleButton>
                    <SimpleButton
                      aria-label={t(`No, do not remove entry for: {{parent}}`, {
                        parent: itemData.domain,
                      })}
                      tabIndex={entryListTabIndex}
                      onClick={() => {
                        uiDispatch({
                          type: 'setDeleteConfirm',
                          payload: {
                            confirmingDelete: false,
                            currentlyDeletingDomain: null,
                          },
                        })
                      }}
                    >
                      <Text fontSize={1} color={colors.primary}>
                        {t('No')}
                      </Text>
                    </SimpleButton>
                  </Flex>
                )}
              />
            )}
            Else={() => (
              // TODO: break this apart to seperate component
              <SettingItem
                noBorder={i === allowlist.length - 1}
                key={i}
                title={itemData.domain}
                headingTip={itemData.domain}
                subHeading={
                  itemData?.addedBy &&
                  t(`Added to support: {{parent}}`, {
                    parent: itemData.addedBy,
                  })
                }
                ControlComponent={() => (
                  <Flex justifyContent="space-around">
                    <Tooltip placement="bottom" message={t('Edit')}>
                      <ActionButton
                        tabIndex={entryListTabIndex}
                        aria-label={t(`Edit allowlist item: {{parent}}`, {
                          parent: itemData.domain,
                        })}
                        onClick={() => {
                          uiDispatch({
                            type: 'setDeleteConfirm',
                            payload: {
                              confirmingDelete: false,
                              currentlyDeletingDomain: null,
                            },
                          })
                          uiDispatch({
                            type: 'editItem',
                            payload: { itemData },
                          })
                        }}
                      >
                        <EditIcon fill={colors.iconFg} />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip placement="bottom" message={t('Delete')}>
                      <ActionButton
                        tabIndex={entryListTabIndex}
                        aria-label={t(`Delete allowlist item: {{parent}}`, {
                          parent: itemData.domain,
                        })}
                        onClick={() =>
                          uiDispatch({
                            type: 'setDeleteConfirm',
                            payload: {
                              confirmingDelete: true,
                              //setting to domain since here (not concating to any other deterministic value)
                              //because we _know_ it has to be unique
                              currentlyDeletingDomain: itemData.domain,
                            },
                          })
                        }
                      >
                        <GarbageIcon fill={colors.iconFg} />
                      </ActionButton>
                    </Tooltip>
                  </Flex>
                )}
              />
            )}
          />
        )
      })}
    </SettingGroup>
  )
}

export default EntryList
