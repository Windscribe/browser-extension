import React, { useEffect, useState } from 'react'

import { InputContainer, Label, Input, Bar } from './styles'

export default ({
  name = '',
  value = '',
  label = name,
  type = 'text',
  noLabel = false,
  placeholder = '',
  required = false,
  autoComplete = 'on',
  isInvalid = false,
  showBar = true,
  inputRef,
  onChange = () => {},
  onBlur = () => {},
  ...props
}) => {
  let [focused, setFocus] = useState(false)
  let [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(!!value.length)
  }, [value])

  return (
    <InputContainer
      isFocused={focused}
      isInvalid={isInvalid}
      noLabel={noLabel}
      {...props}
    >
      {!noLabel && (
        <Label
          htmlFor={name}
          isFocused={focused}
          hasValue={hasValue}
          isInvalid={isInvalid}
        >
          {label}
        </Label>
      )}

      <Input
        id={name}
        ref={inputRef}
        onFocus={() => setFocus(true)}
        onBlur={e => {
          setFocus(false)
          onBlur(e)
        }}
        onChange={onChange}
        type={type}
        value={value}
        name={name}
        required={required}
        autoComplete={autoComplete}
        isInvalid={isInvalid}
        placeholder={noLabel ? placeholder : null}
      />
      {showBar && <Bar isFocused={focused} isInvalid={isInvalid} />}
    </InputContainer>
  )
}
