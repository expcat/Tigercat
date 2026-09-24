import React, { forwardRef, useMemo, useState } from 'react'
import {
  classNames,
  feedbackLayoutLabels,
  getLayoutSidebarClasses,
  getSidebarAriaLabel,
  getSidebarStyle,
  isSidebarFullyHidden,
  resolveSidebarAriaProps,
  type SidebarLandmark,
  type SidebarProps as CoreSidebarProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { SidebarContext } from '../utils/layout-context'

export interface ReactSidebarProps
  extends CoreSidebarProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'width'> {
  children?: React.ReactNode
  /** Set by Layout. Not a public styling prop. */
  landmark?: SidebarLandmark
  collapsible?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export const Sidebar = forwardRef<HTMLElement, ReactSidebarProps>(function Sidebar(
  {
    className,
    width,
    collapsedWidth = '64px',
    collapsed = false,
    side = 'start',
    style,
    children,
    landmark = 'default',
    collapsible = false,
    onCollapsedChange,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const fallbackName = useMemo(() => getSidebarAriaLabel(config.locale), [config.locale])

  const [localCollapsed, setLocalCollapsed] = useState(collapsed)
  const effectiveCollapsed = collapsible ? localCollapsed : collapsed
  const fullyHidden = isSidebarFullyHidden(effectiveCollapsed, collapsedWidth)
  const sidebarClasses = classNames(
    getLayoutSidebarClasses({
      collapsed: effectiveCollapsed,
      side,
      widthProvided: width !== undefined
    }),
    className
  )
  const sidebarStyle: React.CSSProperties = {
    ...style,
    ...getSidebarStyle(effectiveCollapsed, width, collapsedWidth)
  }
  const named =
    landmark === 'plain'
      ? {}
      : resolveSidebarAriaProps({
          ariaLabel: props['aria-label'],
          ariaLabelledby: props['aria-labelledby'],
          fallback: landmark === 'default' ? fallbackName : ''
        })

  const { ['aria-label']: _ignoredLabel, ['aria-labelledby']: _ignoredBy, ...rest } = props
  const Tag = landmark === 'plain' ? 'div' : 'aside'

  const aside = (
    <SidebarContext.Provider value={{ collapsed: effectiveCollapsed }}>
      <Tag
        ref={ref}
        className={sidebarClasses}
        style={sidebarStyle}
        inert={fullyHidden || undefined}
        tabIndex={fullyHidden ? -1 : undefined}
        aria-hidden={fullyHidden || undefined}
        {...named}
        {...rest}>
        {children}
      </Tag>
    </SidebarContext.Provider>
  )
  if (!collapsible) return aside
  const triggerLabel = effectiveCollapsed
    ? feedbackLayoutLabels.sidebarExpand
    : feedbackLayoutLabels.sidebarCollapse
  return (
    <div className="contents" data-tiger-sidebar-shell="">
      {aside}
      <button
        type="button"
        data-tiger-sidebar-trigger=""
        aria-expanded={effectiveCollapsed ? 'false' : 'true'}
        aria-label={triggerLabel}
        onClick={() => {
          const next = !effectiveCollapsed
          setLocalCollapsed(next)
          onCollapsedChange?.(next)
        }}>
        {triggerLabel}
      </button>
    </div>
  )
})

Sidebar.displayName = 'TigerSidebar'
