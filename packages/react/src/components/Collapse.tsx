import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import {
  classNames,
  getCollapseContainerClasses,
  normalizeActiveKeys,
  togglePanelKey,
  type ExpandIconPosition,
  type CollapseProps as CoreCollapseProps
} from '@expcat/tigercat-core'

// Collapse context interface
export interface CollapseContextValue {
  activeKeys: (string | number)[]
  accordion: boolean
  expandIconPosition: ExpandIconPosition
  bordered: boolean
  ghost: boolean
  handlePanelClick: (key: string | number) => void
}

// Create collapse context
const CollapseContext = createContext<CollapseContextValue | null>(null)

// Hook to use collapse context
export function useCollapseContext(): CollapseContextValue | null {
  return useContext(CollapseContext)
}

export interface CollapseProps extends Omit<CoreCollapseProps, 'style'> {
  /**
   * Collapse change event handler
   */
  onChange?: (activeKey: string | number | (string | number)[] | undefined) => void

  /**
   * Collapse panels
   */
  children?: React.ReactNode

  /**
   * Custom styles
   */
  style?: React.CSSProperties
}

export const Collapse: React.FC<CollapseProps> = ({
  activeKey: controlledActiveKey,
  defaultActiveKey,
  accordion = false,
  bordered = true,
  expandIconPosition = 'start',
  ghost = false,
  className,
  style,
  onChange,
  children
}) => {
  // Internal state for uncontrolled mode
  const [internalActiveKeys, setInternalActiveKeys] = useState<(string | number)[]>(
    normalizeActiveKeys(defaultActiveKey)
  )

  // Get current active keys (controlled or uncontrolled)
  const activeKeys = useMemo(() => {
    return controlledActiveKey !== undefined
      ? normalizeActiveKeys(controlledActiveKey)
      : internalActiveKeys
  }, [controlledActiveKey, internalActiveKeys])

  // Handle panel click
  const handlePanelClick = useCallback(
    (key: string | number) => {
      const newKeys = togglePanelKey(key, activeKeys, accordion)

      // Update internal state if uncontrolled
      if (controlledActiveKey === undefined) {
        setInternalActiveKeys(newKeys)
      }

      // Emit change event
      // In accordion mode, emit single value or undefined
      // In normal mode, emit array
      if (onChange) {
        if (accordion) {
          onChange(newKeys.length > 0 ? newKeys[0] : undefined)
        } else {
          onChange(newKeys)
        }
      }
    },
    [activeKeys, accordion, controlledActiveKey, onChange]
  )

  // Container classes
  const containerClasses = useMemo(() => {
    return classNames(getCollapseContainerClasses(bordered, ghost, className))
  }, [bordered, ghost, className])

  // Collapse context value
  const contextValue = useMemo<CollapseContextValue>(
    () => ({
      activeKeys,
      accordion,
      expandIconPosition,
      bordered,
      ghost,
      handlePanelClick
    }),
    [activeKeys, accordion, expandIconPosition, bordered, ghost, handlePanelClick]
  )

  return (
    <CollapseContext.Provider value={contextValue}>
      <div className={containerClasses} style={style} role="region">
        {children}
      </div>
    </CollapseContext.Provider>
  )
}

export default Collapse
