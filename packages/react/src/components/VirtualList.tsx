import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import type {
  VirtualListHandle,
  VirtualListProps as CoreVirtualListProps,
  VirtualListSizeStrategy
} from '@expcat/tigercat-core'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  fixedSizeStrategy,
  variableSizeStrategy,
  dynamicSizeStrategy,
  classNames
} from '@expcat/tigercat-core'

export type { VirtualListHandle }

export interface VirtualListProps
  extends
    CoreVirtualListProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll' | 'children'> {
  /** Render function for each item — receives { index } */
  renderItem: (info: { index: number }) => React.ReactNode
  /**
   * Called with the current `scrollTop` in px (not a DOM Event).
   */
  onScroll?: (scrollTop: number) => void
}

export const VirtualList = forwardRef<VirtualListHandle, VirtualListProps>(function VirtualList(
  {
    itemCount = 0,
    itemHeight = 40,
    estimatedItemHeight,
    getItemHeight,
    sizeStrategy: customStrategy,
    height = 400,
    overscan = 5,
    getItemKey,
    ariaLabel,
    className,
    renderItem,
    onScroll,
    style,
    role,
    ...rest
  },
  ref
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [, bumpMeasuredLayout] = useReducer((count: number) => count + 1, 0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<number, HTMLDivElement>())
  const dynamicStrategyRef = useRef<VirtualListSizeStrategy | null>(null)
  const lastEstimatedRef = useRef<number | undefined>(undefined)

  const strategy = useMemo(() => {
    if (customStrategy) {
      dynamicStrategyRef.current = null
      return customStrategy
    }
    if (getItemHeight) {
      dynamicStrategyRef.current = null
      return variableSizeStrategy(getItemHeight, itemCount)
    }
    if (estimatedItemHeight !== undefined) {
      if (!dynamicStrategyRef.current || lastEstimatedRef.current !== estimatedItemHeight) {
        dynamicStrategyRef.current = dynamicSizeStrategy(estimatedItemHeight, itemCount)
        lastEstimatedRef.current = estimatedItemHeight
      }
      return dynamicStrategyRef.current
    }
    dynamicStrategyRef.current = null
    return fixedSizeStrategy(itemHeight)
  }, [customStrategy, getItemHeight, estimatedItemHeight, itemHeight, itemCount])

  const canMeasure = typeof strategy.updateItemHeight === 'function'

  const range = strategy.getRange(scrollTop, height, itemCount, overscan)

  useLayoutEffect(() => {
    if (!canMeasure || !strategy.updateItemHeight) return
    let changed = false
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const measured = el.offsetHeight
      if (measured > 0 && measured !== strategy.getItemHeight(i)) {
        strategy.updateItemHeight!(i, measured)
        changed = true
      }
    })
    if (changed) bumpMeasuredLayout()
  }, [canMeasure, strategy, range.startIndex, range.endIndex, itemCount])

  const applyScrollTop = useCallback(
    (next: number) => {
      const el = containerRef.current
      const offset = Math.max(0, next)
      if (el && el.scrollTop !== offset) el.scrollTop = offset
      setScrollTop(offset)
      onScroll?.(offset)
    },
    [onScroll]
  )

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex(index: number) {
        const safe = Number.isFinite(index) ? Math.floor(index) : 0
        const clamped = Math.max(0, Math.min(Math.max(itemCount - 1, 0), safe))
        applyScrollTop(strategy.getItemOffset(clamped))
      },
      scrollToOffset(offset: number) {
        applyScrollTop(Number.isFinite(offset) ? offset : 0)
      },
      getScrollElement() {
        return containerRef.current
      }
    }),
    [applyScrollTop, itemCount, strategy]
  )

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const st = containerRef.current.scrollTop
    setScrollTop(st)
    onScroll?.(st)
  }, [onScroll])

  const { startIndex, endIndex, totalHeight, offsetTop } = range
  const resolvedRole = role ?? 'list'
  const asList = resolvedRole === 'list'

  const items: React.ReactNode[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    const itemH = strategy.getItemHeight(i)
    const key = getItemKey ? getItemKey(i) : i
    const itemA11y = asList
      ? { role: 'listitem' as const, 'aria-setsize': itemCount, 'aria-posinset': i + 1 }
      : {}
    if (canMeasure) {
      const index = i
      items.push(
        <div
          key={key}
          ref={(el) => {
            if (el) itemRefs.current.set(index, el)
            else itemRefs.current.delete(index)
          }}
          {...itemA11y}
          style={{ width: '100%' }}>
          {renderItem({ index })}
        </div>
      )
    } else {
      items.push(
        <div
          key={key}
          {...itemA11y}
          style={{ height: `${itemH}px`, width: '100%', overflow: 'hidden' }}>
          {renderItem({ index: i })}
        </div>
      )
    }
  }

  const namedAriaLabel =
    ariaLabel ?? (typeof rest['aria-label'] === 'string' ? rest['aria-label'] : undefined)

  return (
    <div
      {...rest}
      ref={containerRef}
      role={resolvedRole}
      tabIndex={0}
      aria-label={namedAriaLabel}
      className={classNames(virtualListContainerClasses, className)}
      style={{ ...style, height: `${height}px` }}
      onScroll={handleScroll}>
      <div className={virtualListInnerClasses} style={{ height: `${totalHeight}px` }}>
        <div
          style={{
            transform: `translateY(${offsetTop}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
          }}>
          {items}
        </div>
      </div>
    </div>
  )
})

VirtualList.displayName = 'VirtualList'
