import React, { createContext, useContext, useMemo } from 'react'
import {
  classNames,
  getInputGroupClasses,
  getInputGroupAddonClasses,
  type InputGroupSize
} from '@expcat/tigercat-core'

export interface InputGroupContextValue {
  size?: InputGroupSize
  compact?: boolean
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(null)

export function useInputGroupContext(): InputGroupContextValue | null {
  return useContext(InputGroupContext)
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: InputGroupSize
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

  const groupClasses = useMemo(
    () => classNames(getInputGroupClasses(compact, className)),
    [compact, className]
  )

  return (
    <InputGroupContext.Provider value={contextValue}>
      <div {...rest} className={groupClasses} role="group">
        {children}
      </div>
    </InputGroupContext.Provider>
  )
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLSpanElement> {
  addonType?: 'text' | 'icon'
}

export const InputGroupAddon: React.FC<InputGroupAddonProps> = ({
  addonType = 'text',
  className,
  children,
  ...rest
}) => {
  const ctx = useInputGroupContext()
  const size = ctx?.size ?? 'md'
  const compact = ctx?.compact ?? true

  const addonClasses = useMemo(
    () => classNames(getInputGroupAddonClasses(size, compact, className)),
    [size, compact, className]
  )

  return (
    <span {...rest} className={addonClasses}>
      {children}
    </span>
  )
}
