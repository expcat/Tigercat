import React, { createContext, useContext, useMemo } from 'react'
import { getButtonGroupClasses, type ButtonSize } from '@expcat/tigercat-core'

export interface ButtonGroupContextValue {
  size?: ButtonSize
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null)

export function useButtonGroupContext(): ButtonGroupContextValue | null {
  return useContext(ButtonGroupContext)
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ButtonSize
  vertical?: boolean
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  size,
  vertical = false,
  className,
  children,
  ...rest
}) => {
  const contextValue = useMemo(() => ({ size }), [size])

  const groupClasses = useMemo(
    () => getButtonGroupClasses(vertical, className),
    [vertical, className]
  )

  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <div {...rest} className={groupClasses} role="group">
        {children}
      </div>
    </ButtonGroupContext.Provider>
  )
}
