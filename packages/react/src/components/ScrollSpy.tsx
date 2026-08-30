import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  classNames,
  createProgrammaticScrollLock,
  createScrollSpyObserver,
  createScrollSpyPayload,
  flattenScrollSpyItems,
  getInitialScrollSpyActiveKey,
  getScrollSpyItemClasses,
  getScrollSpyItemByKey,
  getScrollSpyKeyString,
  getScrollSpyListClasses,
  getScrollSpyRootClasses,
  scrollSpyNestedListClasses,
  scrollToScrollSpyItem,
  type ScrollSpyChangePayload,
  type ScrollSpyItem,
  type ScrollSpyKey,
  type ScrollSpyProps as CoreScrollSpyProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'

const getWindowContainer = () => window

export interface ScrollSpyProps
  extends
    Omit<CoreScrollSpyProps, 'className' | 'style'>,
    Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'defaultValue' | 'onChange' | 'onClick'> {
  getContainer?: () => HTMLElement | Window
  className?: string
  style?: React.CSSProperties
  onActiveKeyChange?: (
    activeKey: ScrollSpyKey,
    item: ScrollSpyItem,
    payload: ScrollSpyChangePayload
  ) => void
  onClick?: (item: ScrollSpyItem, event: React.MouseEvent<HTMLAnchorElement>) => void
}

export const ScrollSpy: React.FC<ScrollSpyProps> = ({
  items = [],
  activeKey,
  defaultActiveKey,
  offsetTop = 0,
  targetOffset,
  bounds = 5,
  direction = 'vertical',
  sticky = false,
  ariaLabel = 'Scroll navigation',
  getContainer = getWindowContainer,
  className,
  style,
  onActiveKeyChange,
  onClick,
  ...rest
}) => {
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
  const activeKeyString =
    currentActiveKey === undefined ? '' : getScrollSpyKeyString(currentActiveKey)

  const getContainerRef = useRef(getContainer)
  getContainerRef.current = getContainer
  const scrollLockRef = useRef(createProgrammaticScrollLock(() => getContainerRef.current()))

  const emitActive = useCallback(
    (item: ScrollSpyItem, source: ScrollSpyChangePayload['source']) => {
      const nextKeyString = getScrollSpyKeyString(item.key)
      if (nextKeyString === activeKeyString) return

      const payload = createScrollSpyPayload(item, source)
      setActiveKey(item.key, item, payload)
    },
    [activeKeyString, setActiveKey]
  )

  useEffect(() => {
    const container = getContainerRef.current()
    return createScrollSpyObserver(items, {
      container,
      offsetTop,
      targetOffset,
      bounds,
      onChange: (item) => {
        if (scrollLockRef.current.isLocked()) return
        emitActive(item, 'scroll')
      }
    })
  }, [bounds, emitActive, items, offsetTop, targetOffset])

  useEffect(() => {
    return () => {
      scrollLockRef.current.dispose()
    }
  }, [])

  const handleClick = useCallback(
    (item: ScrollSpyItem, event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      if (item.disabled) return

      onClick?.(item, event)
      emitActive(item, 'click')
      scrollLockRef.current.lock()
      scrollToScrollSpyItem(item, getContainerRef.current(), targetOffset ?? offsetTop)
    },
    [emitActive, offsetTop, onClick, targetOffset]
  )

  function renderItems(list: ScrollSpyItem[], nested = false): React.ReactNode {
    return (
      <ul className={nested ? scrollSpyNestedListClasses : getScrollSpyListClasses(direction)}>
        {list.map((item) => {
          const keyString = getScrollSpyKeyString(item.key)
          const isActive = keyString === activeKeyString
          const hasChildren = Boolean(item.children?.length)

          return (
            <li
              key={keyString}
              data-depth={flatItems.find((flat) => flat.key === item.key)?.depth ?? 0}>
              <a
                href={item.href}
                className={getScrollSpyItemClasses(isActive, item.disabled)}
                aria-current={isActive ? 'location' : undefined}
                aria-disabled={item.disabled || undefined}
                data-key={keyString}
                onClick={(event) => handleClick(item, event)}>
                {item.label}
              </a>
              {hasChildren ? renderItems(item.children ?? [], true) : null}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <nav
      {...rest}
      className={classNames(getScrollSpyRootClasses(sticky, className))}
      style={style}
      aria-label={ariaLabel}>
      {renderItems(items)}
    </nav>
  )
}

export default ScrollSpy
