import React, { useState } from 'react'
import { useTheme } from 'ui/hooks'
import { ThemeContext, css } from '@emotion/core'
import styled from '@emotion/styled'
import { Flex, Text } from 'rebass'
import { IconButton } from 'ui/Button'
import ShowPasswordSvg from 'assets/showpassword.svg'
import HidePasswordSvg from 'assets/hidepassword.svg'

const ShowPassword = styled(ShowPasswordSvg)`
  path {
    fill: ${({ theme }) => `${theme.colors.fg}`};
  }
`
const HidePassword = styled(HidePasswordSvg)`
  path {
    fill: ${({ theme }) => `${theme.colors.fg}`};
  }
`
const StyledInput = styled.input`
  ${({ theme, type, isInvalid }) => ` 
    margin-top: ${theme.space[2]};
    width:100%;
    height:40px;
    padding: 12px ${type === 'password' ? '32px' : '16px'} 12px 16px;
    font-size: ${theme.fontSizes[1]};
    color: ${theme.colors.fg};
    border-radius: 3px;
    outline: none;
    border: 1px solid ${isInvalid ? theme.colors.redLight : 'transparent'};
    background-color: ${theme.colors.iconBg};    
    &:focus{
      border: 1px solid ${
        isInvalid ? theme.colors.redLight : theme.colors.iconBg
      };
    }    
`}
`
export default ({
  value,
  setValue,
  labelControl,
  labelText,
  isInvalid,
  message,
  clearError,
  password,
  autoFocus,
  readOnly,
  name,
}) => {
  const [seePassword, setSeePassword] = useState(!password)
  const { colors, fontSizes } = useTheme(ThemeContext)

  const togglePwdVisibility = () => {
    setSeePassword(!seePassword)
  }

  return (
    <Flex flexDirection="column" m={2}>
      <Flex flexDirection="row" justifyContent="space-between">
        {labelControl ? (
          labelControl
        ) : (
          <Text
            fontWeight="bold"
            color={colors.fg}
            minWidth="unset"
            fontSize={fontSizes[1]}
          >
            {labelText}
          </Text>
        )}
        <Text
          color={isInvalid ? colors.redLight : colors.fgLight}
          fontSize={0}
          aria-live="polite"
          alignSelf="flex-end"
          ml={'16px'}
        >
          {message}
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <StyledInput
          noLabel
          name={name}
          showBar={false}
          type={seePassword ? 'text' : 'password'}
          value={value}
          isInvalid={isInvalid}
          onChange={e => {
            if (isInvalid) clearError()
            setValue(e.target.value)
          }}
          autoFocus={autoFocus}
          readOnly={readOnly}
          spellCheck={false}
        />
        {password && (
          <Flex
            pr={1}
            sx={{
              alignSelf: 'flex-end',
              position: 'absolute',
            }}
          >
            <IconButton
              type="button"
              css={css`
                margin-top: 12px;
                &:focus {
                  border: 1px solid ${colors.divider};
                }
              `}
              onClick={readOnly ? null : togglePwdVisibility}
              tabIndex={-1}
            >
              {seePassword ? <HidePassword /> : <ShowPassword />}
            </IconButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
