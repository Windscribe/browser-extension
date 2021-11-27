import React from 'react'
import { useTranslation } from 'react-i18next'
import { css } from '@emotion/core'
import { Flex, Text } from '@rebass/emotion'
import { ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { WebLinkButton, ActionButton } from 'components/Button'
import sadGarry from 'assets/garry/garry-sad.png'
import angryGarry from 'assets/garry/garry-angry.png'
import noDataGarry from 'assets/garry/garry-nodata.png'
import teacherGarry from 'assets/garry/garry-with-apple.png'
import rateUsGarry from 'assets/garry/garry-rate.png'
import cautionGarry from 'assets/garry/garry-caution.png'
import constructionGarry from 'assets/garry/garry-construction.png'
import websiteLink from 'utils/websiteLink'
import { IS_CHROME } from 'utils/constants'

const ConfirmButton = ({ children, ...props }) => {
  const { space, colors } = useTheme(ThemeContext)
  return (
    <ActionButton
      css={css`
        width: 166px;
        margin-bottom: ${space[4]};
      `}
      background={colors.green}
      lg
      {...props}
    >
      {children}
    </ActionButton>
  )
}

const CancelButton = ({ children, ...props }) => (
  <ActionButton
    css={css`
      width: 166px;
    `}
    light
    lg
    {...props}
  >
    {children}
  </ActionButton>
)

const Welcome = ({ close, startOnboarding }) => {
  const { t } = useTranslation()

  return (
    <>
      <ConfirmButton
        onClick={() => {
          close()
          startOnboarding()
        }}
      >
        <Text fontSize={1} p={2} level={3}>
          {t('Start Tutorial')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={2} level={3}>
          {t(`Skip`)}
        </Text>
      </CancelButton>
    </>
  )
}

const ProPlanExpired = ({ close }) => {
  const { t } = useTranslation()

  return (
    <>
      <ConfirmButton
        onClick={() =>
          websiteLink({ path: 'upgrade', params: { pcpid: 'upgrade_ext1' } })
        }
      >
        <Text fontSize={1} p={2} level={3}>
          {t('Renew Plan')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={2} level={3}>
          {t('Ignore')}
        </Text>
      </CancelButton>
    </>
  )
}

const RateUs = ({ close, reject, rejectText }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton
        onClick={() => {
          // link to platform specific store
          if (IS_CHROME) {
            websiteLink({
              customRootUrl: 'https://chrome.google.com/webstore/detail',
              path:
                '/windscribe-free-vpn-and-a/hnmpcagpplmpfojmgmnngilcnanddlhb',
              includeHash: false,
            })
          } else {
            websiteLink({
              customRootUrl: 'https://addons.mozilla.org/firefox/addon',
              path: '/windscribe/',
              includeHash: false,
            })
          }
          close()
        }}
      >
        <Text fontSize={1} p={2} level={3}>
          {t('Sure')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={reject}>
        <Text fontSize={1} p={2} level={3}>
          {t(`${rejectText}`)}
        </Text>
      </CancelButton>
    </>
  )
}

const LocationDown = ({ close }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton
        onClick={() => {
          // link to platform specific store
          websiteLink({
            path: '/status',
            includeHash: false,
          })
          close()
        }}
      >
        <Text fontSize={1} p={0} level={3}>
          {t('Check Status')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={0} level={3}>
          {t(`Back`)}
        </Text>
      </CancelButton>
    </>
  )
}

const NoData = ({ close }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton
        onClick={() =>
          websiteLink({ path: 'upgrade', params: { pcpid: 'upgrade_ext1' } })
        }
      >
        <Text fontSize={1} p={2} level={3}>
          {t('Upgrade')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={2} level={3}>
          {t('Maybe Later')}
        </Text>
      </CancelButton>
    </>
  )
}

const SomethingWeird = ({ close }) => {
  const { t } = useTranslation()
  return (
    <>
      <CancelButton onClick={close}>
        <Text fontSize={1} p={2} level={3}>
          {t('Got it')}
        </Text>
      </CancelButton>
    </>
  )
}

const OtherExtension = ({ close }) => {
  const { t } = useTranslation()
  return (
    <>
      <CancelButton onClick={close}>
        <Text fontSize={1} p={2} level={3}>
          {t('Got it')}
        </Text>
      </CancelButton>
    </>
  )
}

const ConfirmAdvancedMode = ({ close, toggleAdvancedMode }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton onClick={close}>
        <Text fontSize={1} p={1} level={3}>
          {t('Take me back')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={toggleAdvancedMode}>
        <Text fontSize={1} p={1} level={3}>
          {t("Yes, I'm sure")}
        </Text>
      </CancelButton>
    </>
  )
}

const GhostNotAllowed = ({ close, goToSignUp }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton onClick={goToSignUp}>
        <Text fontSize={1} p={2} level={3}>
          {t('Sign up')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={2} level={3}>
          {t(`Back`)}
        </Text>
      </CancelButton>
    </>
  )
}

const GhostNoData = ({ close, goToSignUp }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton onClick={goToSignUp}>
        <Text fontSize={1} p={1} level={3}>
          {t('Get more data')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={0} level={3}>
          {t(`Back`)}
        </Text>
      </CancelButton>
    </>
  )
}

const GhostAddEmail = ({ close, goToAccount }) => {
  const { t } = useTranslation()
  return (
    <>
      <ConfirmButton onClick={goToAccount}>
        <Text fontSize={1} p={1} level={3}>
          {t('Add Email')}
        </Text>
      </ConfirmButton>

      <CancelButton onClick={close}>
        <Text fontSize={1} p={0} level={3}>
          {t(`Maybe later`)}
        </Text>
      </CancelButton>
    </>
  )
}

const getContent = ({ status, t }) => {
  switch (status) {
    case 'banned':
      return {
        title: t("You've been banned"),
        message: t(
          `Your account has been disabled for violating our terms of service`,
        ),
        img: angryGarry,
        AdditionalComponent: () => (
          <WebLinkButton
            onClick={() => websiteLink({ path: 'terms' })}
            lg
            light
          >
            <Text fontSize={1} p={1}>
              {t('Learn More')}
            </Text>
          </WebLinkButton>
        ),
      }
    case 'welcome':
      return {
        title: t(`You Are Connected`),
        message: t(
          `Your connection is now secure.   Do you want to learn how to use the extension?`,
        ),
        img: teacherGarry,
        AdditionalComponent: Welcome,
      }
    case 'proPlanExpired':
      return {
        title: t(`Your Pro Plan Has Expired!`),
        message: t(`You lost access to premium locations and unlimited data.`),
        img: sadGarry,
        AdditionalComponent: ProPlanExpired,
      }
    case 'noData':
      return {
        title: t("You're out of Data"),
        message: t('Please upgrade to stay protected'),
        img: noDataGarry,
        AdditionalComponent: NoData,
      }
    case 'rateUs':
      return {
        title: t('Like what you see?'),
        message: t(
          'Rate us in the extension store as it helps us grow and further improve the product',
        ),
        img: rateUsGarry,
        AdditionalComponent: RateUs,
      }
    case 'confirmAdvancedMode':
      return {
        title: t('Are you sure?'),
        message: t(
          'This will disable all of your current blocker settings, as well as whitelisted sites.',
        ),
        img: cautionGarry,
        AdditionalComponent: ConfirmAdvancedMode,
      }
    case 'somethingWeird':
      return {
        title: t('Something went wrong'),
        message: t(
          'Connection could not be established, please try a different location or contact support',
        ),
        img: constructionGarry,
        AdditionalComponent: SomethingWeird,
      }
    case 'otherExtension':
      return {
        title: t('Extension Conflict'),
        message: t(
          'Your proxy settings are being controlled by another extension. Please disable the conflicting extension to use Windscribe.',
        ),
        img: cautionGarry,
        AdditionalComponent: OtherExtension,
      }
    case 'ffPrivateMode':
      return {
        title: t('Are you using Private Browsing mode in Firefox?'),
        message: t(
          'With Private Browsing, nothing will be saved when you close your browser.',
        ),
        img: constructionGarry,
        AdditionalComponent: ({ close }) => {
          const { t } = useTranslation()
          return <ConfirmButton onClick={close}>{t('Got it')}</ConfirmButton>
        },
      }
    case 'locationDown':
      return {
        title: t('This location is under maintenance'),
        message: t(
          'Please try again later or go to the status page for more info.',
        ),
        img: constructionGarry,
        AdditionalComponent: LocationDown,
      }
    case 'ghostNotAllowed':
      return {
        title: t(`Something's Fishy...`),
        message: t(
          'Unfortunately you cannot use Windscribe without an account as we detected potential abuse. Please make one, it’s really easy',
        ),
        img: cautionGarry,
        AdditionalComponent: GhostNotAllowed,
      }
    case 'ghostNoData':
      return {
        title: t(`Out of Data`),
        message: t(
          'Sign up to get more data or wait until next month for your bandwidth to reset',
        ),
        img: noDataGarry,
        AdditionalComponent: GhostNoData,
      }
    case 'ghostAddEmail':
      return {
        title: t(`You forgot something...`),
        message: t(
          `Add your email to get +10GB/Month, we won't spam, promise.`,
        ),
        img: cautionGarry,
        AdditionalComponent: GhostAddEmail,
      }
    case 'ghostAddEmailPro':
      return {
        title: t(`You forgot something...`),
        message: t(
          `Add your email so you can reset your password if you forget it.`,
        ),
        img: cautionGarry,
        AdditionalComponent: GhostAddEmail,
      }
    default:
      return null
  }
}

export default ({ close, status, ...props }) => {
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  const { title, message, img, AdditionalComponent } = getContent({
    status,
    t,
  })

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      status={status}
      color={colors.white}
      p="40px"
      css={css`
        overflow: hidden;
        height: 100%;
        width: 100%;
        flex: auto !important;
        background-color: ${status === 'banned' && colors.bannedRedTransparent};
        position: absolute;
      `}
    >
      <Flex mb={'24px'}>
        <img src={img} alt="" height={108} width={108} />
      </Flex>
      <Flex
        flexDirection="column"
        mb={'24px'}
        css={css`
          text-align: center;
        `}
      >
        <Text fontWeight="bold" fontSize={2}>
          {title}
        </Text>
        <Text
          pt={3}
          fontSize={1}
          color={colors.halfWhite}
          css={css`
            margin: 0 auto;
            width: 95%;
          `}
        >
          {message}
        </Text>
      </Flex>
      {AdditionalComponent && (
        <AdditionalComponent {...props} close={close} status={status} />
      )}
    </Flex>
  )
}
