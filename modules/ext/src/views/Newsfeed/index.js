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
import NewsIcon from 'assets/news-icon-copy.svg'
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
  height: 6px;
  width: 6px;
  right: 12px;
  top: 13px;
  background-color: ${({ theme }) => theme.colors.green};
`

const NotificationCard = styled(Box)(({ theme, expanded }) => {
  const expandColor = e => (e ? theme.colors.fg : theme.colors.fgLight)
  const dimColor = expandColor(!expanded)
  const brightColor = expandColor(expanded)
  return {
    background: theme.colors.bg,
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
  color: ${({ theme }) => theme.colors.fg};
  font-size: ${({ theme }) => theme.fontSizes[1]};

  p {
    margin: 0 0 20px 0;
    line-height: 20px;
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
    width: 288px;
    height: 40px;
    margin-left: -36px;
    margin-bottom: 8px;
    background: ${({ theme }) => theme.colors.iconBg};
    padding: 0px 10px;
    line-height: 40px;

    text-align: center;
    text-decoration: none;
    border-radius: 24px;
    color: ${({ theme }) => theme.colors.fg} !important;
  }

  .ncta:after {
    content: url(${({ isDark }) => (isDark ? linkOutDark : linkOutLight)});
    float: right;
    position: relative;
    left: -8px;
    top: 2px;
  }
`

const feedSelector = createSelector(
  s => s.theme,
  s => s.newsfeedIdsAlreadyViewed,
  (...args) => args,
)
const Feed = ({ notifications, dispatch }) => {
  const [theme, newsfeedIdsAlreadyViewed] = useConnect(feedSelector)
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const goBack = () => dispatch(actions.view.back())

  return (
    <Scrollbars
      autoHide
      style={{ height: `100%`, position: 'fixed' }}
      renderThumbVertical={({ style, ...props }) => (
        <div
          {...props}
          style={{ ...style, backgroundColor: colors.scrollBar }}
        />
      )}
    >
      <SettingHeader
        onClick={goBack}
        css={css`
          cursor: pointer;
          background-color: #020d1c;
        `}
        prefName={t('News Feed')}
        invert={true}
        showBackButton={true}
        shouldGoBack={false}
      />
      <Flex
        css={css`
          background-color: #020d1c;
          height: 100%;
        `}
      >
        <Accordion
          singleExpand
          expandFirstChild
          items={notifications}
          Title={({ id, title, expand, expanded }) => (
            <NotificationCard
              p={4}
              mt={1}
              css={css`
                cursor: pointer;
              `}
              key={id}
              onClick={expand}
              expanded={expanded}
            >
              <Flex alignItems="center" justifyContent="space-between">
                <NewsfeedTitle
                  className="nf-title"
                  fontSize={0}
                  fontWeight="bold"
                >
                  {title.toLocaleUpperCase()}
                </NewsfeedTitle>
                <IconContainer containerExpanded={expanded}>
                  <PlusIcon className="nf-icon" />
                </IconContainer>
                {!expanded && !newsfeedIdsAlreadyViewed.includes(id) && (
                  <UnreadIcon />
                )}
              </Flex>
            </NotificationCard>
          )}
          Body={({ message, id }) => {
            dispatch(actions.newsfeedIdsAlreadyViewed.push(id))
            return (
              <NotificationCard>
                <Flex p={2}>
                  <Flex ml={2}>
                    <NewsIcon fill={colors.fg} />
                  </Flex>
                  <NewsfeedItem
                    isDark={theme === 'dark'}
                    px={3}
                    dangerouslySetInnerHTML={{ __html: message }}
                  />
                </Flex>
              </NotificationCard>
            )
          }}
        />
      </Flex>
    </Scrollbars>
  )
}

export default () => {
  const dispatch = useDispatch()
  const { loading, notifications = [] } = useConnect(s => s.newsfeedItems)

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
    <Flex
      css={css`
        height: 380px !important;
        flex: auto !important;
      `}
    >
      <Feed notifications={notifications} dispatch={dispatch} />
    </Flex>
  )
}
