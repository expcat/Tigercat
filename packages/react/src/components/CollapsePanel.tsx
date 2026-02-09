import React, { useMemo, useCallback } from 'react'
import {
  classNames,
  getCollapsePanelClasses,
  getCollapsePanelHeaderClasses,
  getCollapseIconClasses,
  collapseHeaderTextClasses,
  collapsePanelContentWrapperClasses,
  collapsePanelContentBaseClasses,
  isPanelActive,
  type CollapsePanelProps as CoreCollapsePanelProps
} from '@expcat/tigercat-core'
import { useCollapseContext } from './Collapse'

export interface CollapsePanelProps extends Omit<CoreCollapsePanelProps, 'style' | 'header'> {
  /**
   * Panel header content (can be a ReactNode for custom header)
   */
  header?: React.ReactNode

  /**
   * Extra content to show at the end of the header
   */
  extra?: React.ReactNode

  /**
   * Panel content
   */
  children?: React.ReactNode

  /**
   * Custom styles
   */
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
  // Get collapse context
  const collapseContext = useCollapseContext()

  if (!collapseContext) {
    throw new Error('CollapsePanel must be used within a Collapse component')
  }

  // Check if this panel is active
  const isActive = useMemo(() => {
    return isPanelActive(panelKey, collapseContext.activeKeys)
  }, [panelKey, collapseContext.activeKeys])

  // Panel classes
  const panelClasses = useMemo(() => {
    return classNames(getCollapsePanelClasses(collapseContext.ghost, className))
  }, [collapseContext.ghost, className])

  // Header classes
  const headerClasses = useMemo(() => {
    return getCollapsePanelHeaderClasses(isActive, disabled)
  }, [isActive, disabled])

  // Icon classes
  const iconClasses = useMemo(() => {
    return getCollapseIconClasses(isActive, collapseContext.expandIconPosition)
  }, [isActive, collapseContext.expandIconPosition])

  // Handle header click
  const handleClick = useCallback(() => {
    if (!disabled) {
      collapseContext.handlePanelClick(panelKey)
    }
  }, [disabled, collapseContext.handlePanelClick, panelKey])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) {
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        collapseContext.handlePanelClick(panelKey)
      }
    },
    [disabled, collapseContext.handlePanelClick, panelKey]
  )

  // Arrow icon
  const arrowIcon = (
    <svg
      className={iconClasses}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 12L10 8L6 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <div className={panelClasses} style={style}>
      {/* Header */}
      <div
        className={headerClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isActive}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Arrow icon at start */}
        {showArrow && collapseContext.expandIconPosition === 'start' && arrowIcon}

        {/* Header text or content */}
        <span className={collapseHeaderTextClasses}>{header}</span>

        {/* Extra content */}
        {extra && <span className="ml-auto">{extra}</span>}

        {/* Arrow icon at end */}
        {showArrow && collapseContext.expandIconPosition === 'end' && arrowIcon}
      </div>

      {/* Content with animation wrapper */}
      <div
        className={collapsePanelContentWrapperClasses}
        style={{
          maxHeight: isActive ? 'none' : '0',
          opacity: isActive ? '1' : '0'
        }}
      >
        <div className={collapsePanelContentBaseClasses}>{children}</div>
      </div>
    </div>
  )
}

export default CollapsePanel
