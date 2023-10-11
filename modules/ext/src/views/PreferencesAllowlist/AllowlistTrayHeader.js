import React, { useEffect, useContext, useRef, useState } from 'react'
import { css } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { Flex, Box, Text } from '@rebass/emotion'
import Branch from 'ui/Branch'
import Input from 'ui/Input'
import { Context } from './state'
import isValidDomain from 'is-valid-domain'
import LinkOutIcon from 'assets/external-link-icon.svg'
import { WebLink } from 'components/Button'
import { useTheme } from 'ui/hooks'
import { ThemeContext } from '@emotion/core'

const DomainContainer = styled(Box)`
  background-color: ${({ theme }) => theme.colors.nanowhite};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 0;
    width: 95%;
    height: 2px;
    background: ${({ theme }) => theme.colors.nanowhite};
  }

  & > * {
    border-bottom: none !important;
  }
`
// TODO: make this cleaner later
const DomainInput = styled(Input)`
  width: 100%;
  input {
    padding: ${({ theme }) => theme.space[2]} !important;
    padding-left: ${({ theme }) => theme.space[4]} !important;
    color: ${({ theme }) => theme.colors.white} !important;
    background-color: transparent;
    ::placeholder {
      color: ${({ theme }) => theme.colors.halfwhite} !important;
      font-weight: bold;
    }
  }
`

export default ({ trayTabIndex }) => {
  const { colors } = useTheme(ThemeContext)
  const { t } = useTranslation()
  const AllowlistContext = useContext(Context)
  const { mode, canSave } = AllowlistContext.state.uiState
  const { domain } = AllowlistContext.state.configState

  const { configDispatch, uiDispatch } = AllowlistContext.dispatches
  const domainInAllowlist = AllowlistContext.actions.entityInExistingAllowlist({
    entity: domain,
  })

  const InputRef = useRef(null)
  const [isDirty, setIsDirty] = useState(false) // do not show errors the first time user types domain

  const checkDomainVality = () => {
    //check if the input is actually a domain on blur/change
    const isValid = isValidDomain(domain) && !domainInAllowlist
    uiDispatch({
      type: 'setCanSave',
      payload: { canSave: isValid },
    })
  }

  useEffect(() => {
    if (mode === 'add' && InputRef.current) {
      setTimeout(() => InputRef.current.focus(), 100)
    }
    if (mode === null) {
      setIsDirty(false)
    }
  }, [mode])

  const modes = {
    edit: t('Edit'),
    add: t('Add New'),
    addCur: t('Add Current'),
  }

  return (
    <>
      <Branch
        if={domainInAllowlist && (mode === 'add' || mode === 'addCur')}
        Then={() => (
          <Text
            aria-live="polite"
            p={1}
            textAlign="center"
            fontSize={1}
            fontWeight="bold"
            color={colors.red}
          >
            {domain} {t('is already allowlisted')}
          </Text>
        )}
        Else={() => (
          <Branch
            if={canSave}
            Then={() => (
              <Text
                color={colors.white}
                aria-live="polite"
                p={1}
                textAlign="center"
                fontSize={1}
                fontWeight="bold"
              >
                {modes[mode]}
              </Text>
            )}
            Else={() => (
              <Text
                aria-live="polite"
                p={1}
                textAlign="center"
                fontSize={0}
                fontWeight="bold"
                color={colors.red}
              >
                {t('Please enter a valid domain')}
              </Text>
            )}
          />
        )}
      />
      <Flex
        flexDirection="column"
        alignItems="center"
        pt={1}
        bg={colors.darkGrey}
        onClick={e => e.stopPropagation()}
      >
        <Flex width="100%">
          <DomainContainer flex={5} py={1} pr={4}>
            <Branch
              if={mode === 'add'}
              Then={() => (
                <DomainInput
                  aria-label="Enter domain to allowlist"
                  showBar={false}
                  aria-required="true"
                  inputRef={InputRef}
                  type="text"
                  autoComplete="off"
                  name="Domain Input"
                  placeholder={t('Enter domain to allowlist')}
                  value={domain}
                  onChange={({ target }) => {
                    configDispatch({
                      type: 'setNewDomain',
                      payload: { newDomain: target.value },
                    })
                    if (isDirty) {
                      checkDomainVality()
                    }
                  }}
                  isInvalid={domainInAllowlist}
                  onBlur={() => {
                    if (!isDirty) {
                      setIsDirty(true)
                    }
                    checkDomainVality()
                  }}
                  noLabel
                />
              )}
              Else={() => (
                <Flex justifyContent={'space-between'}>
                  <Text
                    p={2}
                    fontSize={1}
                    fontWeight={700}
                    mb={1}
                    ml="0.5rem"
                    css={css`
                      color: ${colors.white};
                      overflow: hidden;
                      text-overflow: ellipsis;
                      max-width: 20em;
                    `}
                  >
                    {domain}
                  </Text>
                  {mode !== 'addCur' && (
                    <WebLink
                      tabIndex={trayTabIndex}
                      aria-label={t(`Link to: {{parent}}`, {
                        parent: domain,
                      })}
                      onClick={async () =>
                        browser.tabs.create({
                          url: `http://${domain}`,
                        })
                      }
                    >
                      <LinkOutIcon fill={colors.white} />
                    </WebLink>
                  )}
                </Flex>
              )}
            />
          </DomainContainer>
        </Flex>
      </Flex>
    </>
  )
}
