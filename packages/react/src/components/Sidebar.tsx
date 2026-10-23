import React, { forwardRef, useMemo } from 'react'
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
import { useTigerConfig } from './tiger-config'
import { SidebarContext } from '../utils/layout-context'
import { useControlledState } from '../hooks/useControlledState'

export interface ReactSidebarProps
  extends CoreSidebarProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'width'> {
  children?: React.ReactNode
  /** Set by Layout. Not a public styling prop. */
  landmark?: SidebarLandmark
  collapsible?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export const Sidebar = forwardRef<HTMLDivElement, ReactSidebarProps>(function Sidebar(
  {
    className,
    width,
    collapsedWidth = '64px',
    collapsed,
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

  // Controlled when `collapsed` is passed: the trigger only requests a change.
  const [effectiveCollapsed, setEffectiveCollapsed] = useControlledState({
    value: collapsed,
    defaultValue: false,
    onChange: onCollapsedChange
  })
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
    <div data-tiger-sidebar-shell="" data-side={side}>
      {aside}
      <button
        type="button"
        data-tiger-sidebar-trigger=""
        aria-expanded={effectiveCollapsed ? 'false' : 'true'}
        aria-label={triggerLabel}
        onClick={() => {
          const next = !effectiveCollapsed
          setEffectiveCollapsed(next)
        }}>
        <span aria-hidden="true">☰</span>
      </button>
    </div>
  )
})

Sidebar.displayName = 'TigerSidebar'
