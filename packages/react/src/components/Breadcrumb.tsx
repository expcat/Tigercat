import React, { createContext, useContext } from 'react'
import {
  classNames,
  breadcrumbContainerClasses,
  type BreadcrumbProps as CoreBreadcrumbProps,
  type BreadcrumbSeparator
} from '@tigercat/core'

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
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  separator = '/',
  className,
  style,
  children,
  ...props
}) => {
  // Container classes
  const containerClasses = React.useMemo(
    () => classNames(breadcrumbContainerClasses, className),
    [className]
  )

  // Context value
  const contextValue = React.useMemo<BreadcrumbContextValue>(() => ({ separator }), [separator])

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      <nav className={containerClasses} aria-label="Breadcrumb" style={style} {...props}>
        <ol className="flex items-center flex-wrap gap-2">{children}</ol>
      </nav>
    </BreadcrumbContext.Provider>
  )
}
