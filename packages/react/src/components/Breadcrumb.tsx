import React, { createContext, useContext } from 'react'
import {
  classNames,
  breadcrumbContainerClasses,
  type BreadcrumbProps as CoreBreadcrumbProps,
  type BreadcrumbSeparator
} from '@expcat/tigercat-core'

// Breadcrumb context interface
export interface BreadcrumbContextValue {
  separator: BreadcrumbSeparator
}

// Create breadcrumb context
const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

// Hook to use breadcrumb context
export function useBreadcrumbContext(): BreadcrumbContextValue | null {
  return useContext(BreadcrumbContext)
}

export interface BreadcrumbProps
  extends Omit<CoreBreadcrumbProps, 'style'>, React.HTMLAttributes<HTMLElement> {
  separator?: BreadcrumbSeparator
  /**
   * Extra content aligned to the end of the breadcrumb
   */
  extra?: React.ReactNode
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  separator = '/',
  className,
  style,
  extra,
  children,
  ...props
}) => {
  const hasExtra = Boolean(extra)

  // Container classes
  const containerClasses = React.useMemo(
    () => classNames(breadcrumbContainerClasses, hasExtra && 'w-full', className),
    [className, hasExtra]
  )

  // Context value
  const contextValue = React.useMemo<BreadcrumbContextValue>(() => ({ separator }), [separator])

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      <nav className={containerClasses} aria-label="Breadcrumb" style={style} {...props}>
        <ol className="flex items-center flex-wrap gap-2">{children}</ol>
        {hasExtra && <div className="ml-auto flex items-center">{extra}</div>}
      </nav>
    </BreadcrumbContext.Provider>
  )
}
