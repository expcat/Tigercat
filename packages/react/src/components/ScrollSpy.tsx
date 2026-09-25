import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  classNames,
  createProgrammaticScrollLock,
  createScrollSpyObserver,
  createSectionScrollModel,
  sectionScrollBehavior,
  createScrollSpyPayload,
  flattenScrollSpyItems,
  getInitialScrollSpyActiveKey,
  getScrollSpyItemClasses,
  getScrollSpyItemByKey,
  getScrollSpyKeyString,
  getScrollSpyLabels,
  getScrollSpyListClasses,
  getScrollSpyRootClasses,
  getScrollSpyRootStyle,
  mergeTigerLocale,
  resolveLinkHref,
  resolveScrollSpyContainer,
  resolveScrollSpyOffset,
  shouldActivateScrollSpyClick,
  activateScrollSpyClick,
  type ScrollSpyChangePayload,
  type ScrollSpyItem,
  type ScrollSpyKey,
  type ScrollSpyProps as CoreScrollSpyProps,
  type ScrollRootInput,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './tiger-config'

const EMPTY_ITEMS: ScrollSpyItem[] = []

export interface ScrollSpyProps
  extends
    Omit<CoreScrollSpyProps, 'className' | 'style'>,
    Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'defaultValue' | 'onChange' | 'onClick'> {
  getContainer?: ScrollRootInput
  className?: string
  style?: React.CSSProperties
  locale?: Partial<TigerLocale>
  onActiveKeyChange?: (
    activeKey: ScrollSpyKey,
    item: ScrollSpyItem,
    payload: ScrollSpyChangePayload
  ) => void
  onClick?: (item: ScrollSpyItem, event: React.MouseEvent<HTMLElement>) => void
}

export const ScrollSpy = forwardRef<HTMLElement, ScrollSpyProps>(function ScrollSpy(
  {
    items = EMPTY_ITEMS,
    activeKey,
    defaultActiveKey,
    offsetTop = 0,
    targetOffset,
    bounds = 5,
    orientation = 'vertical',
    sticky = false,
    ariaLabel,
    getContainer,
    className,
    style,
    locale,
    onActiveKeyChange,
    onClick,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const labels = getScrollSpyLabels(mergeTigerLocale(config.locale, locale))
  const offset = resolveScrollSpyOffset(targetOffset, offsetTop)
  const [currentActiveKey, setActiveKey] = useControlledState<
    ScrollSpyKey | undefined,
    [ScrollSpyItem, ScrollSpyChangePayload]
  >({
    value: activeKey,
    defaultValue: getInitialScrollSpyActiveKey(items, undefined, defaultActiveKey),
    onChange: (key, item, payload) => {
      if (key !== undefined) onActiveKeyChange?.(key, item, payload)
    },
    postState: (key) => {
      const item = getScrollSpyItemByKey(items, key)
      if (item && !item.disabled) return key
      return getInitialScrollSpyActiveKey(items, undefined, defaultActiveKey)
    }
  })
  const flatItems = useMemo(() => flattenScrollSpyItems(items), [items])
  const activeKeyRef = useRef(currentActiveKey)
  activeKeyRef.current = currentActiveKey

  const hostRef = useRef<HTMLElement | null>(null)
  const setHostRef = (node: HTMLElement | null) => {
    hostRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }
  const resolvedContainer = resolveScrollSpyContainer(getContainer, hostRef.current, items)
  const containerKey = resolvedContainer === window ? 'window' : (resolvedContainer as HTMLElement)

  const getContainerRef = useRef(getContainer)
  getContainerRef.current = getContainer
  const itemsRef = useRef(items)
  itemsRef.current = items
  const resolveContainer = () =>
    resolveScrollSpyContainer(getContainerRef.current, hostRef.current, itemsRef.current)
  const scrollLockRef = useRef(createProgrammaticScrollLock(() => resolveContainer()))

  const emitActive = useCallback(
    (item: ScrollSpyItem, source: ScrollSpyChangePayload['source']) => {
      const nextKeyString = getScrollSpyKeyString(item.key)
      const current = activeKeyRef.current
      if (current !== undefined && nextKeyString === getScrollSpyKeyString(current)) return

      const payload = createScrollSpyPayload(item, source)
      setActiveKey(item.key, item, payload)
    },
    [setActiveKey]
  )

  useEffect(() => {
    return createScrollSpyObserver(items, {
      container: getContainerRef.current,
      from: hostRef.current,
      offsetTop: offset,
      bounds,
      onChange: (item) => {
        if (scrollLockRef.current.isLocked()) return
        emitActive(item, 'scroll')
      }
    })
  }, [bounds, emitActive, items, offset, containerKey])

  useEffect(() => {
    const scrollLock = scrollLockRef.current
    return () => {
      scrollLock.dispose()
    }
  }, [])

  const handleClick = useCallback(
    (item: ScrollSpyItem, event: React.MouseEvent<HTMLElement>) => {
      if (item.disabled) {
        event.preventDefault()
        return
      }
      if (!shouldActivateScrollSpyClick(item, event.nativeEvent)) return

      event.preventDefault()
      onClick?.(item, event)
      emitActive(item, 'click')
      scrollLockRef.current.lock()
      activateScrollSpyClick(item, resolveContainer(), offset)
    },
    [emitActive, offset, onClick]
  )

  function renderItems(list: ScrollSpyItem[], nested = false): React.ReactNode {
    return (
      <ul className={getScrollSpyListClasses(orientation, nested)} role="list">
        {list.map((item) => {
          const keyString = getScrollSpyKeyString(item.key)
          const isActive =
            currentActiveKey !== undefined && keyString === getScrollSpyKeyString(currentActiveKey)
          const hasChildren = Boolean(item.children?.length)
          const depth =
            flatItems.find((flat) => getScrollSpyKeyString(flat.key) === keyString)?.depth ?? 0
          const safeHref = resolveLinkHref(item.href, { disabled: item.disabled })
          const itemProps = {
            className: getScrollSpyItemClasses(isActive, item.disabled),
            'aria-current': isActive ? ('location' as const) : undefined,
            'aria-disabled': item.disabled || undefined,
            tabIndex: item.disabled ? -1 : undefined,
            'data-key': keyString
          }

          return (
            <li key={keyString} data-depth={depth}>
              {safeHref ? (
                <a {...itemProps} href={safeHref} onClick={(event) => handleClick(item, event)}>
                  {item.label}
                </a>
              ) : (
                <span {...itemProps}>{item.label}</span>
              )}
              {hasChildren ? renderItems(item.children ?? [], true) : null}
            </li>
          )
        })}
      </ul>
    )
  }

  const activeItem = items.find((item) => item.key === currentActiveKey)
  const sectionModel = useMemo(
    () =>
      createSectionScrollModel({
        activeHref: typeof activeItem?.href === 'string' ? activeItem.href : '',
        container: getContainer
      }),
    [activeItem?.href, getContainer]
  )

  return (
    <nav
      {...rest}
      ref={setHostRef}
      className={classNames(getScrollSpyRootClasses(sticky, className))}
      style={getScrollSpyRootStyle(sticky, offset, style as Record<string, string | number>)}
      aria-label={ariaLabel ?? labels.ariaLabel}
      data-tiger-section-behavior={sectionScrollBehavior(sectionModel.reducedMotion)}
      data-tiger-section-active={sectionModel.activeHref}>
      {renderItems(items)}
    </nav>
  )
})

export default ScrollSpy
