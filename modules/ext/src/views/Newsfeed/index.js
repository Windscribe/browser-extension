import React, { useEffect } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { useDispatch, useConnect } from 'ui/hooks'
import { Box, Flex, Text } from '@rebass/emotion'
import { SettingHeader } from 'components/Settings'
import Accordion from 'ui/Accordion'
import { actions } from 'state'
import PlusIcon from 'assets/plus-icon.svg'
import linkOutLight from './linkOutIconLightBase64.js'
import linkOutDark from './linkOutIconDarkBase64.js'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'
import { createSelector } from 'reselect'

const IconContainer = styled(Box)`
  transition: transform ease 0.3s;
  ${({ containerExpanded = false }) => ({
    transform: `rotate(${containerExpanded ? '45deg' : '0'})`,
  })};
`

const UnreadIcon = styled(Box)`
  position: absolute;
  border-radius: 50%;
  height: 8px;
  width: 8px;
  left: 12px;
  background-color: ${({ theme }) => theme.colors.green};
`

const NotificationCard = styled(Box)(({ theme, expanded }) => {
  const expandColor = e => (e ? theme.colors.fg : theme.colors.fgLight)
  const dimColor = expandColor(!expanded)
  const brightColor = expandColor(expanded)
  return {
    background: theme.colors.bgLight,
    '&:hover': {
      '.nf-icon path': {
        fill: !expanded ? dimColor : brightColor,
      },
      '.nf-title': {
        color: !expanded ? dimColor : brightColor,
      },
    },
    '.nf-icon path': {
      fill: brightColor,
    },
    '.nf-title': {
      color: brightColor,
    },
  }
})

const NewsfeedTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.fgLight};
`

const NewsfeedItem = styled(Flex)`
  flex-direction: column;
  color: ${({ theme }) => theme.colors.fgLight};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  p {
    line-height: 20px;
    margin: 0;
  }

  a:link,
  a:visited {
    color: ${({ theme }) => theme.colors.fgLight};
  }

  br {
    display: block;
    margin: 8px 0;
    content: '';
  }

  .ncta {
    display: block;
    height: 40px;
    padding: 0 12px 0 28px;
    line-height: 38px;
    text-align: center;
    text-decoration: none;
    margin-top: 16px;
    border-radius: 20px;
    border: solid 2px ${({ theme }) => theme.colors.fgLight};
    color: ${({ theme }) => theme.colors.fg} !important;
  }

  .ncta:after {
    content: url(${({ isDark }) => (isDark ? linkOutDark : linkOutLight)});
    float: right;
    position: relative;
    top: 3.5px;
  }
`

const feedSelector = createSelector(
  s => s.theme,
  s => s.newsfeedIdsAlreadyViewed,
  (...args) => args,
)

export default () => {
  const dispatch = useDispatch()
  const { loading, notifications = [] } = useConnect(s => s.newsfeedItems)
  const [theme, newsfeedIdsAlreadyViewed] = useConnect(feedSelector)
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(actions.showNewsfeed.set(false))

    if (notifications.length === 0 && !loading) {
      dispatch(
        actions.newsfeedItems.fetch({
          logActivity: 'newsfeed_open',
          checkPopup: true,
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Flex flexDirection="column" bg={colors.bg} width={'100%'}>
      <SettingHeader prefName={t('News Feed')} />
      <Scrollbars
        autoHide
        style={{ height: 340 }}
        renderThumbVertical={({ style, ...props }) => (
          <div
            {...props}
            style={{ ...style, backgroundColor: colors.scrollBar }}
          />
        )}
      >
        <Flex
          pt={'8px'}
          css={css`
            background: ${colors.bg};
            height: 100%;
          `}
        >
          <Accordion
            singleExpand
            expandFirstChild
            items={notifications}
            Title={({ id, title, date, expand, expanded }) => {
              const currentDate = new Date()
              const daysAgo =
                ((Date.parse(currentDate) / 1000 - date) / (3600 * 24)) | 0
              let daysAgoText
              if (daysAgo === 0) {
                daysAgoText = 'Today'
              } else {
                daysAgoText = `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`
              }
              return (
                <NotificationCard
                  p={'16px'}
                  mb={'16px'}
                  mx={'16px'}
                  css={css`
                    cursor: pointer;
                    border-radius: ${expanded ? '6px 6px 0px 0px' : '6px'};
                  `}
                  key={id}
                  onClick={expand}
                  expanded={expanded}
                >
                  <Flex alignItems="center" justifyContent="space-between">
                    {!expanded && !newsfeedIdsAlreadyViewed.includes(id) && (
                      <UnreadIcon />
                    )}
                    <NewsfeedTitle
                      className="nf-title"
                      fontSize={0}
                      fontWeight="bold"
                      css={css`
                        display: flex;
                        align-items: center;
                        margin-top: 3px;
                      `}
                    >
                      {title.toLocaleUpperCase()}
                    </NewsfeedTitle>
                    <IconContainer
                      containerExpanded={expanded}
                      width="16px"
                      height="16px"
                    >
                      <PlusIcon className="nf-icon" />
                    </IconContainer>
                  </Flex>
                  {expanded && (
                    <Text color={colors.fgLight} mt={'6px'} fontSize={'12px'}>
                      {daysAgoText}
                    </Text>
                  )}
                </NotificationCard>
              )
            }}
            Body={({ message, id }) => {
              dispatch(actions.newsfeedIdsAlreadyViewed.push(id))
              return (
                <NotificationCard
                  mt={'-16px'}
                  mb={'16px'}
                  mx={'16px'}
                  css={css`
                    border-radius: 0px 0px 6px 6px;
                  `}
                >
                  <Flex pb={'16px'} px={'16px'}>
                    <NewsfeedItem
                      isDark={theme === 'dark'}
                      dangerouslySetInnerHTML={{ __html: message }}
                    />
                  </Flex>
                </NotificationCard>
              )
            }}
          />
        </Flex>
      </Scrollbars>
    </Flex>
  )
}
