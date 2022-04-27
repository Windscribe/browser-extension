import React, { useRef, useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text, Box } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import Flags from 'assets/flags'
import { Container } from './styles'
import LocationInfo from './LocationInfo'
import ConnectionStatus from './ConnectionStatus'
import ConnectButtonContainer from './ConnectButtonContainer'
import IPAddress from './IPAddress'
import SettingAlert from 'ui/Alert'
import LocationsButton from './LocationsButton'

const selector = createSelector(
  s => s.currentLocation.countryCode,
  s => s.online,
  s => s.proxy.status,
  (...args) => args,
)

export default memo(() => {
  const [countryCode, online, status] = useSelector(selector)

  const { t } = useTranslation()
  const Flag = Flags[countryCode] || Flags['AUTO']
  const viewContainerRef = useRef()
  const [showIpCopiedAlert, setIpCopiedAlert] = useState(false)
  const [isHoveringOnLocation, setIsHoveringOnLocation] = useState(false)
  const { colors } = useTheme(ThemeContext)

  return (
    <>
      {viewContainerRef.current && (
        <SettingAlert
          content={
            <Text fontSize={0} color={colors.grey}>
              {t('IP address copied!')}
            </Text>
          }
          showing={showIpCopiedAlert}
          badgeStyledAs={Flex}
          customBadgeStyle={css`
            padding: 8px 12px;
            background: ${colors.darkGrey};
            border-radius: 30px;
          `}
          isReversed={true}
          topOffset="70%"
          leftOffset="33%"
          domNode={viewContainerRef.current}
        />
      )}
      <Container
        Flag={Flag}
        online={online}
        status={status}
        ref={viewContainerRef}
      >
        <Flex flexDirection="column" flex={1}>
          <Flex
            flexDirection="row"
            flex={1}
            css={css`
              align-items: center;
              justify-content: start;
            `}
          >
            <ConnectionStatus status={status} online={online} />
            {(status === 'connected' ||
              status === 'disconnected' ||
              status === 'error') && (
              <IPAddress
                showIpCopiedAlert={showIpCopiedAlert}
                setIpCopiedAlert={setIpCopiedAlert}
              />
            )}
          </Flex>
          <LocationInfo setIsHovering={setIsHoveringOnLocation} />
        </Flex>
        <Box
          css={css`
            height: 50px;
          `}
        >
          <LocationsButton
            isHovering={isHoveringOnLocation}
            setIsHovering={setIsHoveringOnLocation}
          />
        </Box>
        <ConnectButtonContainer />
      </Container>
    </>
  )
})
