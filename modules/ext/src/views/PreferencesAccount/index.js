import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { useClientRect } from 'ui/hooks'
import addOneMonthToDate from 'utils/addOneMonthToDate'
import bytes from 'bytes'
import Branch from 'ui/Branch'
import styled from '@emotion/styled'
import { css, ThemeContext } from '@emotion/core'
import { useTheme } from 'ui/hooks'
import { Flex, Text, Box } from '@rebass/emotion'
import { SettingHeader, SettingItem, SettingGroup } from 'components/Settings'
import { WebLink } from 'components/Button'
import { InlineButton } from 'ui/Button'
import EditIcon from 'assets/edit-icon.svg'
import websiteLink from 'utils/websiteLink'
import ConfirmEmail from 'views/Preferences/ConfirmEmail'
import { EMAIL, ACCOUNT_PLAN } from 'utils/constants'
import { WithToolTip } from 'components/Utils'

const MAX_TEXT_WIDTH = 220

const SectionItem = styled(Flex)`
  justify-content: space-between;
`

const EmailContainer = styled(SettingItem)`
  ${({ verified = false, theme }) => ({
    color: !verified && theme.colors.orange,
    '.warning-icon': {
      display: verified ? 'none' : 'block',
    },
  })};
`
const ControlText = ({ children, textColorClass, space, colors }) => {
  const textRef = useRef(null)
  const { width: textWidth } = useClientRect(textRef)
  return (
    <WithToolTip
      tip={children}
      showOnOverflow
      elWidth={textWidth}
      maxWidth={MAX_TEXT_WIDTH}
    >
      <div>
        <Text
          color={colors.fg}
          fontSize={1}
          innerRef={textRef}
          className={textColorClass}
          css={css`
            padding-left: ${space[2]};
            word-break: break-all;
            width: fit-content;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: ${MAX_TEXT_WIDTH}px;
          `}
        >
          {children}
        </Text>
      </div>
    </WithToolTip>
  )
}

const ConfirmYourEmailSection = ({
  resendConfirmation,
  confirmationSent,
  colors,
}) => {
  const { t } = useTranslation()
  return (
    <>
      {confirmationSent && (
        <Text aria-live="polite" pl={3} fontSize={0} color={colors.white}>
          {t('Confirmation email sent!')}
        </Text>
      )}

      {!confirmationSent && (
        <Flex style={{ width: '100%' }} justifyContent="space-between">
          <Text pl={3} fontSize={0} color={colors.white}>
            {t('Please confirm your email')}
          </Text>
          <InlineButton
            aria-label={t('resend confirmation email')}
            opacity="0.6"
            light
            onClick={resendConfirmation}
          >
            <Text color={colors.white} fontWeight="bold" fontSize={0} mr={3}>
              {t('Resend').toLocaleUpperCase()}
            </Text>
          </InlineButton>
        </Flex>
      )}
    </>
  )
}

const sessionSelectorFuncs = [
  'traffic_max',
  'email',
  'email_status',
  'last_reset',
  'is_premium',
  'username',
  'premium_expiry_date',
].reduce((acc, key) => ({ [key]: s => s.session[key], ...acc }), {})

const selector = createStructuredSelector(sessionSelectorFuncs)

export default () => {
  const { t } = useTranslation()
  const { colors, space } = useTheme(ThemeContext)
  const {
    traffic_max = 0,
    email,
    email_status,
    last_reset,
    is_premium,
    username,
    premium_expiry_date,
  } = useSelector(selector)

  const isPremiumUser = is_premium
  const hasUnlimitedData = traffic_max === ACCOUNT_PLAN.UNLIMITED

  return (
    <Flex flexDirection="column" bg={colors.bg}>
      <SettingHeader
        prefName={t('Account')}
        AdditionalIcon={EditIcon}
        usePrimary
        additionalIconTip="My Account"
        buttonProps={{
          background: colors.primary,
          onClick: () => websiteLink({ path: 'myaccount' }),
        }}
      />
      <Box mx={3}>
        <SettingGroup groupName={t('Info')}>
          <SettingItem
            title={t('Username')}
            ControlComponent={() => (
              <ControlText space={space} colors={colors}>
                {username}
              </ControlText>
            )}
          />

          <EmailContainer
            verified={email_status === EMAIL.VERIFIED}
            title={t('Email')}
            ControlComponent={style => (
              <Branch
                if={email}
                Then={() => (
                  <ControlText
                    space={space}
                    colors={colors}
                    textColorClass={style.className}
                  >
                    {email}
                  </ControlText>
                )}
                Else={() => (
                  <WebLink
                    onClick={() => websiteLink({ path: 'myaccount' })}
                    color={colors.primary}
                    solid
                  >
                    <Text fontSize={1}>
                      {hasUnlimitedData ? t('Add') : t('Add Email (+8GB)')}
                    </Text>
                  </WebLink>
                )}
              />
            )}
          />

          {email && email_status === EMAIL.UNCONFIRMED && (
            <SectionItem
              ml={-4}
              style={{
                backgroundColor: colors.orange,
                border: 'none',
              }}
              py={3}
            >
              <ConfirmEmail>
                {renderProps => (
                  <ConfirmYourEmailSection colors={colors} {...renderProps} />
                )}
              </ConfirmEmail>
            </SectionItem>
          )}
        </SettingGroup>

        <SettingGroup groupName={t('Plan')}>
          <Branch
            if={isPremiumUser}
            Then={() => (
              <SettingItem
                title={t('Pro')}
                ControlComponent={() => (
                  <Text color={colors.fg} fontSize={1}>
                    {t('')}
                  </Text>
                )}
              />
            )}
            Else={() => (
              <SettingItem
                title={
                  traffic_max === ACCOUNT_PLAN.UNLIMITED
                    ? t('Custom Unlimited')
                    : `${bytes(traffic_max)}/month`
                }
                ControlComponent={() => (
                  <WebLink
                    onClick={() =>
                      websiteLink({
                        path: 'upgrade',
                        params: { pcpid: 'upgrade_ext1' },
                      })
                    }
                    color={colors.primary}
                    solid
                  >
                    <Text fontSize={1}>{t('Upgrade')}</Text>
                  </WebLink>
                )}
              />
            )}
          />
          <SettingItem
            noBorder
            title={isPremiumUser ? t('Expiry Date') : t('Reset Date')}
            ControlComponent={() => (
              <Text color={colors.fg} fontSize={1}>
                {isPremiumUser
                  ? premium_expiry_date
                  : addOneMonthToDate(last_reset)}
              </Text>
            )}
          />
        </SettingGroup>
      </Box>
    </Flex>
  )
}
