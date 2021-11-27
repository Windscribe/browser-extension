import React from 'react'
import { css } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state/dux'
import { SettingItem } from 'components/Settings'
import ToggleSettingItem from './ToggleSettingItem'
import LinkOutIcon from 'assets/external-link-icon.svg'
import { WebLink } from 'components/Button'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()

  const dispatch = useDispatch()

  return (
    <>
      <ToggleSettingItem
        title={t('Advanced Mode')}
        subHeading={t(
          'Turning off advanced mode will disable your custom uBlock settings.',
        )}
        checked={true}
        onClick={() => {
          dispatch(actions.view.set('ConfirmAdvancedMode'))
        }}
        aria-label={t(
          'Turning off advanced mode will disable your custom uBlock settings.',
        )}
      />
      <SettingItem
        noBorder
        title={t('µBlock Settings')}
        ControlComponent={() => (
          <WebLink
            aria-label={t('uBlock Settings')}
            onClick={() =>
              browser.tabs.create({ url: 'options-ui/index.html' })
            }
          >
            <LinkOutIcon
              css={css`
                path {
                  fill: ${colors.iconFg};
                }
              `}
            />
          </WebLink>
        )}
      />
    </>
  )
}
