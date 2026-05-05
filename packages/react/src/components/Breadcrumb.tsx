import React, { createContext, useCallback, useContext, useMemo } from 'react'
import {
  classNames,
  breadcrumbContainerClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getSeparatorContent,
  type BreadcrumbItemProps as CoreBreadcrumbItemProps,
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

export interface BreadcrumbItemProps
  extends
    Omit<CoreBreadcrumbItemProps, 'style'>,
    Omit<React.LiHTMLAttributes<HTMLLIElement>, 'onClick' | 'children'> {
  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void

  style?: React.CSSProperties

  /**
   * Item content
   */
  children?: React.ReactNode

  /**
   * Icon to display before the item content
   */
  icon?: React.ReactNode
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  href,
  target,
  current = false,
  separator: customSeparator,
  className,
  style,
  onClick,
  children,
  icon,
  ...props
}) => {
  const breadcrumbContext = useBreadcrumbContext()

  const itemClasses = useMemo(() => getBreadcrumbItemClasses(className), [className])

  const linkClasses = useMemo(() => getBreadcrumbLinkClasses(current), [current])

  const separatorClasses = useMemo(() => getBreadcrumbSeparatorClasses(), [])

  const separatorContent = useMemo(() => {
    const separator =
      customSeparator !== undefined ? customSeparator : breadcrumbContext?.separator || '/'
    return getSeparatorContent(separator)
  }, [customSeparator, breadcrumbContext])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => {
      if (!current) {
        onClick?.(event)
      }
    },
    [current, onClick]
  )

  const computedRel = useMemo(() => {
    if (target === '_blank') {
      return 'noopener noreferrer'
    }
    return undefined
  }, [target])

  const contentElements = icon ? (
    <>
      <span className="inline-flex">{icon}</span>
      {children}
    </>
  ) : (
    children
  )

  const linkElement =
    href && !current ? (
      <a
        className={linkClasses}
        href={href}
        target={target}
        rel={computedRel}
        onClick={handleClick}>
        {contentElements}
      </a>
    ) : (
      <span className={linkClasses} aria-current={current ? 'page' : undefined}>
        {contentElements}
      </span>
    )

  const separatorElement = !current ? (
    <span className={separatorClasses} aria-hidden="true">
      {separatorContent}
    </span>
  ) : null

  return (
    <li className={itemClasses} style={style} {...props}>
      {linkElement}
      {separatorElement}
    </li>
  )
}

export interface BreadcrumbProps
  extends Omit<CoreBreadcrumbProps, 'style'>, React.HTMLAttributes<HTMLElement> {
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
