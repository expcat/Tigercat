import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getCollapseContainerClasses,
  getCollapseHeaderTarget,
  normalizeActiveKeys,
  collapseLevelKeys,
  type CollapseHeaderFocusAction,
  type ExpandIconPosition,
  type CollapseProps as CoreCollapseProps
} from '@expcat/tigercat-core'

export interface CollapseContextValue {
  activeKeys: (string | number)[]
  accordion: boolean
  expandIconPosition: ExpandIconPosition
  bordered: boolean
  ghost: boolean
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6
  handlePanelClick: (key: string | number) => void
  moveHeaderFocus: (current: HTMLButtonElement, action: CollapseHeaderFocusAction) => void
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
  headingLevel = 3,
  className,
  style,
  onChange,
  children,
  ...rest
}) => {
  const [internalActiveKeys, setInternalActiveKeys] = useState<(string | number)[]>(() =>
    normalizeActiveKeys(defaultActiveKey, { accordion })
  )
  const rootRef = useRef<HTMLDivElement>(null)

  const activeKeys = useMemo(() => {
    return controlledActiveKey !== undefined
      ? normalizeActiveKeys(controlledActiveKey, { accordion })
      : internalActiveKeys
  }, [controlledActiveKey, internalActiveKeys, accordion])

  const handlePanelClick = useCallback(
    (key: string | number) => {
      const newKeys = collapseLevelKeys(activeKeys, key, accordion)

      if (controlledActiveKey === undefined) {
        setInternalActiveKeys(newKeys)
      }

      onChange?.(newKeys)
    },
    [activeKeys, accordion, controlledActiveKey, onChange]
  )

  const moveHeaderFocus = useCallback((current: HTMLButtonElement, action: CollapseHeaderFocusAction) => {
    const root = rootRef.current
    if (!root) return
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-tiger-collapse-header]')
    ).filter(
      (button) =>
        button.closest('[data-tiger-collapse]') === root &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true'
    )
    const index = buttons.indexOf(current)
    const next = getCollapseHeaderTarget(
      buttons.map(() => ({ disabled: false })),
      index,
      action
    )
    if (next >= 0) buttons[next]?.focus()
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
      headingLevel,
      handlePanelClick,
      moveHeaderFocus
    }),
    [
      activeKeys,
      accordion,
      expandIconPosition,
      bordered,
      ghost,
      headingLevel,
      handlePanelClick,
      moveHeaderFocus
    ]
  )

  return (
    <CollapseContext.Provider value={contextValue}>
      <div ref={rootRef} className={containerClasses} style={style} data-tiger-collapse="" {...rest}>
        {children}
      </div>
    </CollapseContext.Provider>
  )
}

export default Collapse
