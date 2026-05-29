import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  classNames,
  breadcrumbContainerClasses,
  breadcrumbEllipsisClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getSeparatorContent,
  getBreadcrumbCollapsedItems,
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
  maxItems,
  className,
  style,
  extra,
  children,
  ...props
}) => {
  const hasExtra = Boolean(extra)
  const [expanded, setExpanded] = useState(false)

  // Container classes
  const containerClasses = React.useMemo(
    () => classNames(breadcrumbContainerClasses, hasExtra && 'w-full', className),
    [className, hasExtra]
  )

  // Context value
  const contextValue = React.useMemo<BreadcrumbContextValue>(() => ({ separator }), [separator])

  const renderedItems = useMemo(() => {
    const items = React.Children.toArray(children)

    if (expanded || maxItems === undefined || maxItems <= 0 || maxItems >= items.length) {
      return items
    }

    const { collapsed } = getBreadcrumbCollapsedItems(items.length, maxItems)
    if (collapsed.length === 0) return items

    const collapsedSet = new Set(collapsed)
    const result: React.ReactNode[] = []
    let ellipsisInserted = false
    items.forEach((item, index) => {
      if (collapsedSet.has(index)) {
        if (!ellipsisInserted) {
          ellipsisInserted = true
          result.push(
            <li key="__tiger-breadcrumb-ellipsis" className={getBreadcrumbItemClasses()}>
              <button
                type="button"
                className={breadcrumbEllipsisClasses}
                aria-label="Show collapsed breadcrumb items"
                onClick={() => setExpanded(true)}>
                ...
              </button>
              <span className={getBreadcrumbSeparatorClasses()} aria-hidden="true">
                {getSeparatorContent(separator)}
              </span>
            </li>
          )
        }
        return
      }
      result.push(item)
    })
    return result
  }, [children, expanded, maxItems, separator])

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      <nav className={containerClasses} aria-label="Breadcrumb" style={style} {...props}>
        <ol className="flex items-center flex-wrap gap-2">{renderedItems}</ol>
        {hasExtra && <div className="ml-auto flex items-center">{extra}</div>}
      </nav>
    </BreadcrumbContext.Provider>
  )
}
