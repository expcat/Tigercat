import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef
} from 'react'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  classNames,
  breadcrumbContainerClasses,
  breadcrumbEllipsisClasses,
  breadcrumbExtraClasses,
  breadcrumbListClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbLinkClasses,
  getBreadcrumbSeparatorClasses,
  getBreadcrumbSlots,
  getBreadcrumbCollapsedItems,
  breadcrumbCollapsedMenuItems,
  resolveLinkHref,
  getSeparatorKind,
  getSeparatorContent,
  resolveBreadcrumbItemCurrent,
  resolveLinkAddress,
  mergeTigerLocale,
  getBreadcrumbLabels,
  type BreadcrumbItemProps as CoreBreadcrumbItemProps,
  type BreadcrumbProps as CoreBreadcrumbProps,
  type BreadcrumbSeparator,
  type TigerLocale,
  type TigerLocaleBreadcrumb
} from '@expcat/tigercat-core'
import { chevronLeftSolidIcon20PathD } from '@expcat/tigercat-core/icons/picker'
import { useTigerConfig } from './tiger-config'

export interface BreadcrumbContextValue {
  separator: BreadcrumbSeparator
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function useBreadcrumbContext(): BreadcrumbContextValue | null {
  return useContext(BreadcrumbContext)
}

function SeparatorMark({ separator }: { separator: BreadcrumbSeparator }) {
  const kind = getSeparatorKind(separator)
  const classes = getBreadcrumbSeparatorClasses()
  if (kind === 'arrow' || kind === 'chevron') {
    return (
      <span className={classes} aria-hidden="true">
        <svg
          className={`h-3.5 w-3.5 ${kind === 'arrow' ? '-scale-x-100 rtl:scale-x-100' : 'rtl:-scale-x-100'}`}
          viewBox={icon20ViewBox}
          fill="currentColor">
          <path fillRule="evenodd" d={chevronLeftSolidIcon20PathD} clipRule="evenodd" />
        </svg>
      </span>
    )
  }
  return (
    <span className={classes} aria-hidden="true">
      {getSeparatorContent(separator)}
    </span>
  )
}

export interface BreadcrumbItemProps
  extends
    Omit<CoreBreadcrumbItemProps, 'style' | 'icon'>,
    Omit<React.LiHTMLAttributes<HTMLLIElement>, 'onClick' | 'children'> {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
  style?: React.CSSProperties
  children?: React.ReactNode
  icon?: React.ReactNode
  /** @internal */
  isLast?: boolean
  /** @internal */
  trailing?: React.ReactNode
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (
    {
      href,
      target,
      current,
      separator: _separator,
      className,
      style,
      onClick,
      children,
      icon,
      isLast = false,
      trailing,
      ...props
    },
    ref
  ) => {
    const isCurrent = resolveBreadcrumbItemCurrent(current, isLast)
    const itemClasses = getBreadcrumbItemClasses(className)
    const linkClasses = getBreadcrumbLinkClasses(isCurrent)

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        if (isCurrent) return
        onClick?.(event)
      },
      [isCurrent, onClick]
    )

    const address = resolveLinkAddress({ href, target })
    const contentElements = icon ? (
      <>
        <span className="inline-flex">{icon}</span>
        {children}
      </>
    ) : (
      children
    )

    let control: React.ReactNode
    if (isCurrent) {
      control = (
        <span className={linkClasses} aria-current="page">
          {contentElements}
        </span>
      )
    } else if (address.href) {
      control = (
        <a
          className={linkClasses}
          href={address.href}
          target={address.target}
          rel={address.rel}
          onClick={handleClick}>
          {contentElements}
        </a>
      )
    } else if (onClick) {
      control = (
        <button type="button" className={linkClasses} onClick={handleClick}>
          {contentElements}
        </button>
      )
    } else {
      control = <span className={getBreadcrumbLinkClasses(true)}>{contentElements}</span>
    }

    return (
      <li ref={ref} className={itemClasses} style={style} {...props}>
        {control}
        {trailing}
      </li>
    )
  }
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

export interface BreadcrumbProps
  extends
    Omit<CoreBreadcrumbProps, 'style' | 'extra'>,
    Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  extra?: React.ReactNode
  children?: React.ReactNode
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleBreadcrumb>
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      separator = '/',
      maxItems,
      className,
      style,
      extra,
      children,
      locale,
      labels: labelsOverride,
      ...props
    },
    ref
  ) => {
    const { 'aria-label': ariaLabelProp, ...rest } = props
    const config = useTigerConfig()
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () => getBreadcrumbLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )
    const items = useMemo(() => React.Children.toArray(children), [children])
    const itemSignature = items
      .map((item) => (React.isValidElement(item) ? String(item.key ?? '') : ''))
      .join('|')
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
      setExpanded(false)
    }, [itemSignature, maxItems])

    const hasExtra = Boolean(extra)
    const containerClasses = classNames(breadcrumbContainerClasses, hasExtra && 'w-full', className)
    const contextValue = useMemo<BreadcrumbContextValue>(() => ({ separator }), [separator])
    const slots = getBreadcrumbSlots(items.length, maxItems, false)
    const collapsed = getBreadcrumbCollapsedItems(items.length, maxItems ?? items.length).collapsed

    const rendered = slots.map((slot, index) => {
      const nodes: React.ReactNode[] = []
      if (slot.type === 'ellipsis') {
        nodes.push(
          <li key="__tiger-breadcrumb-ellipsis" className={getBreadcrumbItemClasses()}>
            <button
              type="button"
              className={breadcrumbEllipsisClasses}
              aria-label={labels.expandAriaLabel}
              aria-expanded={expanded}
              aria-haspopup="menu"
              onClick={() => setExpanded((open) => !open)}>
              ...
            </button>
            {expanded ? (
              <div role="menu" data-tiger-breadcrumb-menu="">
                {breadcrumbCollapsedMenuItems(
                  collapsed.map((itemIndex) => {
                    const child = items[itemIndex]
                    const href =
                      React.isValidElement(child) &&
                      typeof (child.props as { href?: string }).href === 'string'
                        ? (child.props as { href?: string }).href
                        : undefined
                    const text =
                      React.isValidElement(child) &&
                      (typeof (child.props as { children?: unknown }).children === 'string' ||
                        typeof (child.props as { children?: unknown }).children === 'number')
                        ? String((child.props as { children?: unknown }).children)
                        : ''
                    return { key: itemIndex, label: text || href || String(itemIndex), href }
                  })
                ).map((entry) => (
                  <a key={entry.key} role="menuitem" href={resolveLinkHref(entry.href)}>
                    {entry.label}
                  </a>
                ))}
              </div>
            ) : null}
            {index !== slots.length - 1 ? <SeparatorMark separator={separator} /> : null}
          </li>
        )
      } else {
        const child = items[slot.index]
        const isLast = slot.index === items.length - 1
        const trailing = index !== slots.length - 1 ? <SeparatorMark separator={separator} /> : null
        nodes.push(
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<BreadcrumbItemProps>, {
                key: child.key ?? slot.index,
                isLast,
                trailing
              })
            : child
        )
      }
      return nodes
    })

    const nav = (
      <nav
        ref={ref}
        className={hasExtra ? undefined : containerClasses}
        aria-label={ariaLabelProp ?? labels.ariaLabel}
        style={hasExtra ? undefined : style}
        {...rest}>
        <ol
          className={
            hasExtra ? breadcrumbListClasses : classNames(breadcrumbListClasses, 'w-full')
          }>
          {rendered}
        </ol>
      </nav>
    )

    if (!hasExtra) {
      return <BreadcrumbContext.Provider value={contextValue}>{nav}</BreadcrumbContext.Provider>
    }

    return (
      <BreadcrumbContext.Provider value={contextValue}>
        <div className={containerClasses} style={style}>
          {nav}
          <div className={breadcrumbExtraClasses}>{extra}</div>
        </div>
      </BreadcrumbContext.Provider>
    )
  }
)
Breadcrumb.displayName = 'Breadcrumb'
