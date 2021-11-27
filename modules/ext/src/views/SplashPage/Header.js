import React from 'react'
import { Box, Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { css } from '@emotion/core'
import WsBadge from 'assets/splash/ws-rotating-logo2.gif'

export default ({ home }) => {
  const { t } = useTranslation()
  return (
    <>
      <Box
        mt={48}
        height={40}
        width={40}
        onClick={home}
        css={css`
          &:hover {
            cursor: pointer;
          }
        `}
      >
        <img height={40} width={40} src={WsBadge} alt="logo" />
      </Box>
      <Text
        mt={24}
        width="220px"
        fontFamily="plex-sans"
        fontSize={4}
        fontWeight="bold"
        textAlign="center"
      >
        {t('Keep Your Secrets.')}
      </Text>
    </>
  )
}
