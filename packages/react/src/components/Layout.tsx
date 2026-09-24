import React, { forwardRef, useContext, useMemo } from 'react'
import {
  classNames,
  getLayoutRootClasses,
  getLayoutSkipLinkClasses,
  getSkipToContentLabel,
  isLayoutSiderTypeName,
  LAYOUT_MAIN_ID,
  resolveLayoutHasSider,
  resolveSidebarLandmark,
  warnIfLayoutSiderMissed,
  type LayoutProps as CoreLayoutProps,
  type SidebarLandmark
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { LayoutContext, type LayoutContextValue } from '../utils/layout-context'

export interface ReactLayoutProps
  extends CoreLayoutProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: React.ReactNode
}

function siderTypeName(child: React.ReactElement): string | undefined {
  const type = child.type as { displayName?: string; name?: string }
  return type.displayName || type.name
}

function isSiderChild(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false
  return isLayoutSiderTypeName(siderTypeName(child))
}

function childHasOwnSidebarName(child: React.ReactElement): boolean {
  const props = child.props as { 'aria-label'?: unknown; 'aria-labelledby'?: unknown }
  const label = typeof props['aria-label'] === 'string' ? props['aria-label'].trim() : ''
  const labelledby =
    typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'].trim() : ''
  return Boolean(label || labelledby)
}

export const Layout = forwardRef<HTMLDivElement, ReactLayoutProps>(function Layout(
  { className, children, hasSider, mode, fullHeight = false, style, ...props },
  ref
) {
  const parent = useContext(LayoutContext)
  const config = useTigerConfig()
  const nested = parent != null
  const shellFullHeight = fullHeight && !nested
  const childArray = React.Children.toArray(children)
  const childNames = childArray.map((child) =>
    React.isValidElement(child) ? siderTypeName(child) : undefined
  )
  const childIsSider = childArray.some(isSiderChild)
  if (!childIsSider && hasSider === undefined) {
    warnIfLayoutSiderMissed({ hasSider, childNames })
  }
  const resolvedHasSider = resolveLayoutHasSider({ hasSider, mode, childIsSider })

  let claimed = Boolean(parent?.namedSidebarClaimed)
  const rendered = childArray.map((child) => {
    if (!React.isValidElement(child) || !isSiderChild(child)) return child
    const landmark: SidebarLandmark = resolveSidebarLandmark({
      hasOwnName: childHasOwnSidebarName(child),
      namedSidebarClaimed: claimed
    })
    if (landmark === 'default') claimed = true
    return React.cloneElement(child, { landmark } as Partial<unknown>)
  })

  const contextValue = useMemo<LayoutContextValue>(
    () => ({
      nested,
      hasSider: resolvedHasSider,
      fullHeight: shellFullHeight,
      namedSidebarClaimed: claimed
    }),
    [nested, resolvedHasSider, shellFullHeight, claimed]
  )

  const layoutClasses = classNames(
    getLayoutRootClasses({
      hasSider: resolvedHasSider,
      nested,
      fullHeight
    }),
    className
  )

  return (
    <LayoutContext.Provider value={contextValue}>
      <div ref={ref} className={layoutClasses} style={style} {...props}>
        {nested ? null : (
          <a className={getLayoutSkipLinkClasses()} href={`#${LAYOUT_MAIN_ID}`}>
            {getSkipToContentLabel(config.locale)}
          </a>
        )}
        {rendered}
      </div>
    </LayoutContext.Provider>
  )
})

Layout.displayName = 'TigerLayout'
