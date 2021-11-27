import React from 'react'
import styled from '@emotion/styled'
import InfoIconSvg from 'assets/info-icon.svg'
import { SimpleButton } from 'ui/Button'
import { Flex, Text } from '@rebass/emotion'
import { useDispatch } from 'ui/hooks'
import { actions } from 'state'
import { useTranslation } from 'react-i18next'

const InfoIcon = styled(InfoIconSvg)`
  path {
    fill: ${({ theme }) => theme.colors.white};
    fill-opacity: 0.404;
  }
`
const Button = styled(SimpleButton)`
  padding: 0;
  margin: 0 0 ${({ theme }) => theme.space[1]} ${({ theme }) => theme.space[2]};
`
export default () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const showError = () => dispatch(actions.view.set('SomethingWeird'))
  return (
    <Flex alignItems="center">
      <Text fontWeight="bold">{t('PROXY FAILURE')}</Text>
      <Button onClick={showError}>
        <InfoIcon />
      </Button>
    </Flex>
  )
}
