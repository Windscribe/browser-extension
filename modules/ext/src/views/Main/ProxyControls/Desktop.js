import React, { useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { IS_FIREFOX } from 'utils/constants'
import { Flex, Text, Box } from '@rebass/emotion'
import { css } from '@emotion/core'
import { useSelector, useDispatch } from 'react-redux'
import websiteLink from 'utils/websiteLink'
import { createSelector } from 'reselect'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { actions } from 'state'
import { Container } from './styles'
import LocationInfo from './LocationInfo'
import ExternalAppOnIcon from 'assets/ext-app-on.svg'
import ExternalAppMissingIcon from 'assets/ext-app-missing.svg'
import Branch from 'ui/Branch'

const getDataCenterFromId = (id, serverListData) =>
  serverListData?.reduce(
    (obj, loc) => {
      const dataCenter = loc.groups?.find(g => g.id === id)
      if (!dataCenter) {
        return obj
      }
      return {
        nickname: dataCenter?.nick,
        name: dataCenter?.city,
      }
    },
    { name: 'No', nickname: 'Location' },
  )

const selectDataCenters = createSelector(
  s => s.session.our_dc,
  s => s.serverList.data,
  (our_dc, serverListData) => getDataCenterFromId(our_dc, serverListData),
)

const desktopLocation = ({
  isSupportedOS,
  desktopClientInstalled,
  our_ip,
  dataCenters,
  t,
}) => {
  if ((desktopClientInstalled && !our_ip) || !isSupportedOS) {
    return { name: t('No Location') }
  } else if (desktopClientInstalled || our_ip) {
    return dataCenters
  } else {
    return { name: t('Add the desktop app') }
  }
}

const HasExternalApp = ({ isConnectedToDesktop, our_ip, colors }) => (
  <Flex
    css={css`
      height: ${IS_FIREFOX ? '144px' : '140px'};
      position: absolute;
      transform: translate(0px, ${isConnectedToDesktop ? '-4px' : '-7px'});
    `}
  >
    {/* {isConnectedToDesktop && isConnectedToProxy && (
      <ConnectorLine
        invert
        css={css`
          position: absolute;
        `}
      />
    )} */}
    <ExternalAppOnIcon
      fill={our_ip ? colors.green : colors.white}
      css={css`
        transform: ${our_ip ? 'rotate( 0deg )' : 'rotate( 180deg )'};
      `}
    />
  </Flex>
)

const ExternalAppMissing = () => (
  <Box
    css={css`
      cursor: pointer;
      transform: translate(0px, -4px);
    `}
    onClick={() => websiteLink({ path: '/download' })}
  >
    <ExternalAppMissingIcon />
  </Box>
)

const selector = createSelector(
  s => s.currentOS,
  s => s.session.our_ip,
  s => s.desktopClient.installed,
  s => s.desktopClient.isConnected,
  s => s.proxy.status,
  selectDataCenters,
  (...args) => args,
)

export default memo(({ style, currentInterface }) => {
  const [
    currentOS,
    our_ip,
    desktopClientInstalled,
    isConnectedToDesktop,
    proxyStatus,
    dataCenters,
  ] = useSelector(selector)
  const isConnectedToProxy = proxyStatus === 'connected'
  const { t } = useTranslation()
  const { colors } = useTheme(ThemeContext)
  // desktop app detection does not work properly on non-supported platforms
  // so we just show no location view to compensate
  const isSupportedOS = currentOS === 'mac' || currentOS === 'win'
  const doubleHop = isConnectedToDesktop && isConnectedToProxy
  const dispatch = useDispatch()
  const descriptionText = () => {
    if (doubleHop) {
      return ''
    }
    if (desktopClientInstalled || our_ip) {
      return t('Use the desktop app to turn on/off or switch locations')
    }

    return t(
      'Install the desktop app to proxy your connection through two locations with double hop mode',
    )
  }

  useEffect(() => {
    dispatch(actions.desktopClient.fetch())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [our_ip])

  return (
    <Container style={style} flexDirection="row-reverse">
      <Flex
        flexDirection="column"
        flex={1}
        mb={
          !desktopClientInstalled
            ? '4px'
            : !isConnectedToDesktop
            ? '14px'
            : '0px'
        }
        css={css`
          z-index: 10;
        `}
      >
        {doubleHop && (
          <Flex justifyContent="space-between">
            <Text
              tabIndex={0}
              aria-live="polite"
              fontSize={1}
              fontWeight="bold"
              color={colors.green}
              css={css`
                text-transform: uppercase;
                margin-right: 8px;
              `}
            >
              {t('DOUBLE HOP')}
            </Text>
          </Flex>
        )}

        <LocationInfo
          currentInterface={currentInterface}
          doubleHop={doubleHop}
          desktopLocation={desktopLocation({
            isSupportedOS,
            desktopClientInstalled,
            our_ip,
            t,
            dataCenters,
          })}
        />
        <Text fontSize={0} color={colors.white}>
          {descriptionText()}
        </Text>
      </Flex>

      <Flex
        mr={3}
        css={css`
          width: 72px;
          height: 70px;
          z-index: 100;
          align-self: flex-end;
        `}
      >
        <Branch
          if={desktopClientInstalled || our_ip || !isSupportedOS}
          Then={() =>
            HasExternalApp({
              isConnectedToDesktop,
              isConnectedToProxy,
              our_ip,
              colors,
            })
          }
          Else={() => ExternalAppMissing()}
        />
      </Flex>
    </Container>
  )
})
