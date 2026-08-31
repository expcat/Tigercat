import React, { createContext, useContext, useMemo } from 'react'
import {
  classNames,
  getInputGroupClasses,
  getInputGroupAddonClasses,
  TIGER_CHROME_ATTR,
  type ComponentSize
} from '@expcat/tigercat-core'

export interface InputGroupContextValue {
  size?: ComponentSize
  compact?: boolean
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(null)

export function useInputGroupContext(): InputGroupContextValue | null {
  return useContext(InputGroupContext)
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ComponentSize
  compact?: boolean
}

export const InputGroup: React.FC<InputGroupProps> = ({
  size = 'md',
  compact = false,
  className,
  children,
  ...rest
}) => {
  const contextValue = useMemo(() => ({ size, compact }), [size, compact])
  const named = Boolean(rest['aria-label'] || rest['aria-labelledby'])

  const groupClasses = useMemo(
    () => classNames(getInputGroupClasses(compact, className)),
    [compact, className]
  )

  return (
    <InputGroupContext.Provider value={contextValue}>
      <div {...rest} className={groupClasses} role={named ? 'group' : undefined}>
        {children}
      </div>
    </InputGroupContext.Provider>
  )
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const InputGroupAddon: React.FC<InputGroupAddonProps> = ({
  className,
  children,
  ...rest
}) => {
  const ctx = useInputGroupContext()
  const size = ctx?.size ?? 'md'
  const compact = ctx?.compact ?? false

  const addonClasses = useMemo(
    () => classNames(getInputGroupAddonClasses(size, compact, className)),
    [size, compact, className]
  )

  return (
    <span {...rest} {...{ [TIGER_CHROME_ATTR]: '' }} className={addonClasses}>
      {children}
    </span>
  )
}
