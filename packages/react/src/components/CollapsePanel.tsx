import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import {
  classNames,
  collapseExtraClasses,
  collapseHeaderRowClasses,
  collapseHeaderTextClasses,
  collapsePanelContentBaseClasses,
  collapsePanelContentWrapperClasses,
  createAriaIdScope,
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
  const ariaIdsRef = useRef<{ header: string; content: string } | null>(null)
  if (ariaIdsRef.current === null) {
    const ariaIds = createAriaIdScope()
    ariaIdsRef.current = {
      header: ariaIds.next({ prefix: 'tiger-collapse-header' }),
      content: ariaIds.next({ prefix: 'tiger-collapse-content' })
    }
  }
  const headerId = ariaIdsRef.current.header
  const contentId = ariaIdsRef.current.content

  if (!collapseContext) {
    throw new Error('CollapsePanel must be used within a Collapse component')
  }

  const isActive = useMemo(() => {
    return isPanelActive(panelKey, collapseContext.activeKeys)
  }, [panelKey, collapseContext.activeKeys])

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
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
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
      collapseContext.moveHeaderFocus(event.currentTarget, action)
    },
    [disabled, collapseContext, panelKey]
  )

  const pendingFocusRestore = useRef(false)
  const wasActiveRef = useRef(isActive)
  if (wasActiveRef.current && !isActive && contentRef.current?.contains(document.activeElement)) {
    pendingFocusRestore.current = true
  }
  wasActiveRef.current = isActive

  useLayoutEffect(() => {
    if (!pendingFocusRestore.current) return
    pendingFocusRestore.current = false
    headerRef.current?.focus()
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

  const Heading = `h${collapseContext.headingLevel}` as 'h3'

  return (
    <div className={panelClasses} style={style}>
      <div className={collapseHeaderRowClasses}>
        <Heading className="m-0 min-w-0 flex-1 font-[inherit]">
          <button
            ref={headerRef}
            type="button"
            id={headerId}
            data-tiger-collapse-header=""
            className={headerClasses}
            aria-expanded={isActive}
            aria-controls={isActive ? contentId : undefined}
            aria-disabled={disabled || undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}>
            {showArrow && collapseContext.expandIconPosition === 'start' && arrowIcon}
            <span className={collapseHeaderTextClasses}>{header}</span>
            {showArrow && collapseContext.expandIconPosition === 'end' && arrowIcon}
          </button>
        </Heading>
        {extra ? <span className={collapseExtraClasses}>{extra}</span> : null}
      </div>

      {isActive ? (
        <div
          ref={contentRef}
          id={contentId}
          data-tiger-collapse-content=""
          className={collapsePanelContentWrapperClasses}
          role="region"
          aria-labelledby={headerId}>
          <div className={collapsePanelContentBaseClasses}>{children}</div>
        </div>
      ) : null}
    </div>
  )
}

export default CollapsePanel
