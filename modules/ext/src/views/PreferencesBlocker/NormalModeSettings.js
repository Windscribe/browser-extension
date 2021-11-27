import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useConnect } from 'ui/hooks'
import { actions } from 'state/dux'
import ToggleSettingItem from './ToggleSettingItem'
import { createSelector } from 'reselect'

const selector = createSelector(
  s => s.blockLists,
  s => s.blockListsEnabled,
  (...args) => args,
)

export default ({ ACTIVITY, setReloadTrue }) => {
  const [blockLists, blockListsEnabled] = useConnect(selector)

  const dispatch = useDispatch()
  const { t } = useTranslation()

  const blockListLoaded = list => blockListsEnabled.includes(list)

  const toggleBlockList = v => () =>
    dispatch(
      actions.blockListsEnabled.toggle({ listItem: v, logActivity: ACTIVITY }),
    )

  const blockListContentCache = {
    adblock: {
      title: t('Ad Crusher'),
      subHeading: t(
        'Indiscriminately annihilate all annoying ads with extreme prejudice',
      ),
      linkPath: 'features/ad-blocking',
    },
    trackers: {
      title: t('Tracker Eradicator'),
      subHeading: t('Stop trackers in their filthy tracks'),
      linkPath: 'features/ad-blocking',
    },
    malware: {
      title: t('Malware Evader'),
      subHeading: t(
        'Block access to known malware, phishing and other malicious domains',
      ),
      linkPath: 'features/ad-blocking',
    },
    social: {
      title: t('Social Distancing'),
      subHeading: t('Block tracking social network widgets and buttons'),
      linkPath: 'features/ad-blocking',
    },
    cookieaway: {
      title: t('Cookie Go Away'),
      subHeading: t('Blocks annoying "We use cookies" banners on all websites'),
      linkPath: 'features/ad-blocking',
    },
  }

  const blockListContent = {}

  blockLists.list.forEach(l => {
    if (l?.description) {
      blockListContent[l.option] = {
        title: t(l.label),
        subHeading: t(l.description),
        linkPath: l.link,
      }
    } else {
      // use the cached data, since this users indexdb data is using old format still
      blockListContent[l.option] = blockListContentCache[l.option]
    }
  })

  return (
    <>
      {blockLists.list.map(x => (
        <ToggleSettingItem
          aria-label={
            blockListContent[x.option].title +
            '.' +
            blockListContent[x.option].subHeading
          }
          key={x.option}
          {...blockListContent[x.option]}
          toggleState={blockListLoaded(x.option)}
          toggleEvent={toggleBlockList(x.option)}
          postToggleEvent={setReloadTrue}
          linkPath={blockListContent[x.option].linkPath}
        />
      ))}
      <ToggleSettingItem
        noBorder
        title={t('Advanced Mode')}
        subHeading={t(
          'Manage all blocklists through the native uBlock interface.',
        )}
        checked={false}
        onClick={() => {
          dispatch(actions.view.set('ConfirmAdvancedMode'))
        }}
        aria-label={t(
          'Advanced Mode. Manage all blocklists through the native uBlock interface.',
        )}
      />
    </>
  )
}
