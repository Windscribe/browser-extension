import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect, useDispatch } from 'ui/hooks'
import Joyride from 'react-joyride'
import JoyrideTooltip from 'components/Onboarding/JoyrideTooltip'
import { Global, css } from '@emotion/core'
import { actions } from 'state'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const createSteps = ({ t }) => {
  const steps = [
    {
      target: '.joyride-element-proxy-button path',
      content: <p>{t('Turn on the proxy')}</p>,
      placement: 'left-end',
      disableBeacon: true,
    },
    {
      target: '.joyride-element-change-location',
      content: <p>{t('Change location')}</p>,
      placement: 'left',
    },
    {
      target: '.joyride-element-whitelist',
      content: (
        <p>
          {t('Whitelist a site to bypass our proxy,')}
          <br />
          {t('allow ads, or enable cookie storage')}
        </p>
      ),
      placement: 'top',
    },
    {
      target: '.joyride-element-browser',
      content: (
        <p>
          {t('Control your browser proxy')}
          <br /> {t('settings by clicking here')}
        </p>
      ),
    },
    {
      target: '.joyride-element-desktop',
      content: (
        <p>
          {t('Or, if you have the Windscribe app,')}
          <br />
          {t('view your desktop connection')}
        </p>
      ),
      placement: 'left',
    },
    {
      target: '.joyride-element-opt-out',
      content: (
        <p>
          {t('Access the tutorial and other')}
          <br />
          {t('settings by clicking here')}
        </p>
      ),
    },
  ]
  return steps
}

export default () => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const showOnboarding = useConnect(s => s.showOnboarding)
  // eslint-disable-next-line
  const [target, setTarget] = useState('')
  const steps = createSteps({ t })

  useEffect(() => {
    if (showOnboarding) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }, [showOnboarding])

  return (
    <>
      <Global
        styles={css`
          /* hacky */
          #react-joyride-step-3
            .__floater
            .__floater__body:first-of-type {
            margin-left: 20px;           
          }

          #react-joyride-step-1
            .__floater
            .__floater__body:first-of-type {
            margin-bottom: -30px;
            .__floater__arrow{
             span{
                margin: 12px 0;
              }
            }            
          }

          .__floater .__floater__body {
            font-size: 13px;
            min-width: 130px;

            & p {
              margin 0;
              color: ${colors.black};
            }
          }
        `}
      />
      <Joyride
        continuous
        steps={steps}
        disableOverlayClose
        run={showOnboarding}
        tooltipComponent={JoyrideTooltip}
        callback={({ status, step }) => {
          setTarget(step.target)

          if (status === 'finished' || status === 'skipped') {
            dispatch(actions.showOnboarding.set(false))
          }
        }}
        styles={{
          overlay: { cursor: 'auto' },
          options: {
            overlayColor: colors.halfblack,
          },
        }}
        floaterProps={{
          styles: {
            arrow: {
              spread: 16,
              length: 8,
              margin: 12,
            },
            container: {
              maxWidth: 250,
            },
          },
        }}
      />
    </>
  )
}
