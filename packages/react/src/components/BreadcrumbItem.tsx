import React, { useCallback, useMemo } from 'react'
import {
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getSeparatorContent,
  type BreadcrumbItemProps as CoreBreadcrumbItemProps
} from '@tigercat/core'
import { useBreadcrumbContext } from './Breadcrumb'

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
  // Get breadcrumb context
  const breadcrumbContext = useBreadcrumbContext()

  // Item classes
  const itemClasses = useMemo(
    () => getBreadcrumbItemClasses(current, className),
    [current, className]
  )

  // Link classes
  const linkClasses = useMemo(() => getBreadcrumbLinkClasses(current), [current])

  // Separator classes
  const separatorClasses = useMemo(() => getBreadcrumbSeparatorClasses(), [])

  // Get separator content
  const separatorContent = useMemo(() => {
    const sep =
      customSeparator !== undefined ? customSeparator : breadcrumbContext?.separator || '/'
    return getSeparatorContent(sep)
  }, [customSeparator, breadcrumbContext])

  // Handle click
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => {
      if (!current) {
        onClick?.(event)
      }
    },
    [current, onClick]
  )

  // Compute rel attribute for external links
  const computedRel = useMemo(() => {
    if (target === '_blank') {
      return 'noopener noreferrer'
    }
    return undefined
  }, [target])

  // Content elements
  const contentElements = icon ? (
    <>
      <span className="inline-flex">{icon}</span>
      {children}
    </>
  ) : (
    children
  )

  // Link or span element
  const linkElement =
    href && !current ? (
      <a
        className={linkClasses}
        href={href}
        target={target}
        rel={computedRel}
        aria-current={current ? 'page' : undefined}
        onClick={handleClick}>
        {contentElements}
      </a>
    ) : (
      <span className={linkClasses} aria-current={current ? 'page' : undefined}>
        {contentElements}
      </span>
    )

  // Separator element (not rendered for current/last item)
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
