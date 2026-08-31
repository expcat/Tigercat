import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getCollapseContainerClasses,
  getNextAccordionHeaderIndex,
  normalizeActiveKeys,
  togglePanelKey,
  type CollapseHeaderFocusAction,
  type CollapseHeaderRecord,
  type ExpandIconPosition,
  type CollapseProps as CoreCollapseProps
} from '@expcat/tigercat-core'

export interface CollapseContextValue {
  activeKeys: (string | number)[]
  accordion: boolean
  expandIconPosition: ExpandIconPosition
  bordered: boolean
  ghost: boolean
  handlePanelClick: (key: string | number) => void
  registerHeader: (record: CollapseHeaderRecord) => void
  unregisterHeader: (key: string) => void
  moveHeaderFocus: (currentKey: string, action: CollapseHeaderFocusAction) => void
}

const CollapseContext = createContext<CollapseContextValue | null>(null)

export function useCollapseContext(): CollapseContextValue | null {
  return useContext(CollapseContext)
}

export interface CollapseProps
  extends Omit<CoreCollapseProps, 'style'>, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Always an array. Empty `[]` is a controlled all-closed state.
   */
  onChange?: (activeKey: (string | number)[]) => void
  children?: React.ReactNode
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
  children,
  ...rest
}) => {
  const [internalActiveKeys, setInternalActiveKeys] = useState<(string | number)[]>(() =>
    normalizeActiveKeys(defaultActiveKey, { accordion })
  )
  const headersRef = useRef<CollapseHeaderRecord[]>([])

  const activeKeys = useMemo(() => {
    return controlledActiveKey !== undefined
      ? normalizeActiveKeys(controlledActiveKey, { accordion })
      : internalActiveKeys
  }, [controlledActiveKey, internalActiveKeys, accordion])

  const handlePanelClick = useCallback(
    (key: string | number) => {
      const newKeys = togglePanelKey(key, activeKeys, accordion)

      if (controlledActiveKey === undefined) {
        setInternalActiveKeys(newKeys)
      }

      onChange?.(newKeys)
    },
    [activeKeys, accordion, controlledActiveKey, onChange]
  )

  const registerHeader = useCallback((record: CollapseHeaderRecord) => {
    const headers = headersRef.current
    const index = headers.findIndex((header) => header.key === record.key)
    if (index >= 0) {
      headers[index] = record
    } else {
      headers.push(record)
    }
  }, [])

  const unregisterHeader = useCallback((key: string) => {
    headersRef.current = headersRef.current.filter((header) => header.key !== key)
  }, [])

  const moveHeaderFocus = useCallback((currentKey: string, action: CollapseHeaderFocusAction) => {
    const next = getNextAccordionHeaderIndex(headersRef.current, currentKey, action)
    if (next >= 0) {
      headersRef.current[next]?.el.focus()
    }
  }, [])

  const containerClasses = useMemo(() => {
    return classNames(getCollapseContainerClasses(bordered, ghost, className))
  }, [bordered, ghost, className])

  const contextValue = useMemo<CollapseContextValue>(
    () => ({
      activeKeys,
      accordion,
      expandIconPosition,
      bordered,
      ghost,
      handlePanelClick,
      registerHeader,
      unregisterHeader,
      moveHeaderFocus
    }),
    [
      activeKeys,
      accordion,
      expandIconPosition,
      bordered,
      ghost,
      handlePanelClick,
      registerHeader,
      unregisterHeader,
      moveHeaderFocus
    ]
  )

  return (
    <CollapseContext.Provider value={contextValue}>
      <div className={containerClasses} style={style} {...rest}>
        {children}
      </div>
    </CollapseContext.Provider>
  )
}

export default Collapse
