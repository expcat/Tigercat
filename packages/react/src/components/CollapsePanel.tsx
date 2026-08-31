import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  collapseExtraClasses,
  collapseHeaderRowClasses,
  collapseHeaderTextClasses,
  collapseKeyOf,
  collapsePanelContentBaseClasses,
  collapsePanelContentWrapperClasses,
  createAriaId,
  createCollapseTransitionController,
  getCollapseIconClasses,
  getCollapsePanelClasses,
  getCollapsePanelHeaderClasses,
  isPanelActive,
  type CollapsePanelProps as CoreCollapsePanelProps
} from '@expcat/tigercat-core'
import { useCollapseContext } from './Collapse'

export interface CollapsePanelProps extends Omit<
  CoreCollapsePanelProps,
  'style' | 'header' | 'extra'
> {
  header?: React.ReactNode
  extra?: React.ReactNode
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const CollapsePanel: React.FC<CollapsePanelProps> = ({
  panelKey,
  header,
  disabled = false,
  showArrow = true,
  className,
  style,
  extra,
  children
}) => {
  const collapseContext = useCollapseContext()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLButtonElement | null>(null)
  const transitionControllerRef = useRef<ReturnType<
    typeof createCollapseTransitionController
  > | null>(null)
  const initialActiveRef = useRef<boolean | null>(null)
  const headerIdRef = useRef(createAriaId({ prefix: 'tiger-collapse-header' }))
  const contentIdRef = useRef(createAriaId({ prefix: 'tiger-collapse-content' }))
  const [controllerReady, setControllerReady] = useState(false)

  if (!collapseContext) {
    throw new Error('CollapsePanel must be used within a Collapse component')
  }

  const isActive = useMemo(() => {
    return isPanelActive(panelKey, collapseContext.activeKeys)
  }, [panelKey, collapseContext.activeKeys])

  if (initialActiveRef.current === null) {
    initialActiveRef.current = isActive
  }

  const panelClasses = useMemo(() => {
    return classNames(getCollapsePanelClasses(collapseContext.ghost, className))
  }, [collapseContext.ghost, className])

  const headerClasses = useMemo(() => {
    return getCollapsePanelHeaderClasses(isActive, disabled)
  }, [isActive, disabled])

  const iconClasses = useMemo(() => {
    return getCollapseIconClasses(isActive, collapseContext.expandIconPosition)
  }, [isActive, collapseContext.expandIconPosition])

  const handleClick = useCallback(() => {
    if (!disabled) {
      collapseContext.handlePanelClick(panelKey)
    }
  }, [disabled, collapseContext, panelKey])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        collapseContext.handlePanelClick(panelKey)
        return
      }

      if (!collapseContext.accordion) return

      const action =
        event.key === 'ArrowDown'
          ? 'next'
          : event.key === 'ArrowUp'
            ? 'prev'
            : event.key === 'Home'
              ? 'first'
              : event.key === 'End'
                ? 'last'
                : null

      if (!action) return
      event.preventDefault()
      collapseContext.moveHeaderFocus(collapseKeyOf(panelKey), action)
    },
    [disabled, collapseContext, panelKey]
  )

  useLayoutEffect(() => {
    if (!contentRef.current) return undefined

    const controller = createCollapseTransitionController(contentRef.current, {
      expanded: initialActiveRef.current ?? false
    })
    transitionControllerRef.current = controller
    setControllerReady(true)

    return () => {
      transitionControllerRef.current = null
      controller.dispose()
    }
  }, [])

  useLayoutEffect(() => {
    const key = collapseKeyOf(panelKey)
    collapseContext.registerHeader({
      key,
      el: {
        focus: () => {
          headerRef.current?.focus()
        }
      },
      disabled
    })
    return () => {
      collapseContext.unregisterHeader(key)
    }
  }, [collapseContext, panelKey, disabled])

  useLayoutEffect(() => {
    transitionControllerRef.current?.update(isActive)
  }, [isActive])

  const arrowIcon = (
    <svg
      className={iconClasses}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const initialClass = controllerReady
    ? undefined
    : initialActiveRef.current
      ? 'max-h-none opacity-100'
      : 'max-h-0 opacity-0'

  return (
    <div className={panelClasses} style={style}>
      <div className={collapseHeaderRowClasses}>
        <button
          ref={headerRef}
          type="button"
          id={headerIdRef.current}
          className={headerClasses}
          aria-expanded={isActive}
          aria-controls={contentIdRef.current}
          aria-disabled={disabled || undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}>
          {showArrow && collapseContext.expandIconPosition === 'start' && arrowIcon}
          <span className={collapseHeaderTextClasses}>{header}</span>
          {showArrow && collapseContext.expandIconPosition === 'end' && arrowIcon}
        </button>
        {extra ? <span className={collapseExtraClasses}>{extra}</span> : null}
      </div>

      <div
        ref={contentRef}
        id={contentIdRef.current}
        data-tiger-collapse-content=""
        className={classNames(collapsePanelContentWrapperClasses, initialClass)}
        role={isActive ? 'region' : undefined}
        aria-labelledby={isActive ? headerIdRef.current : undefined}
        {...(!isActive
          ? {
              inert: true,
              'aria-hidden': true
            }
          : {})}>
        <div className={collapsePanelContentBaseClasses}>{children}</div>
      </div>
    </div>
  )
}

export default CollapsePanel
