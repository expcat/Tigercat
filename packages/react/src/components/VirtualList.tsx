import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import type {
  VirtualListHandle,
  VirtualListProps as CoreVirtualListProps,
  VirtualListSizeStrategy,
  VirtualScrollAlign
} from '@expcat/tigercat-core'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  fixedSizeStrategy,
  variableSizeStrategy,
  dynamicSizeStrategy,
  classNames,
  observeSize,
  readMarginBoxBlockSize,
  resolveScrollportViewport,
  scrollTopForVirtualAlign,
  warnFixedRowOverflow
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
  /**
   * Rendered inside the scroller after the window. Not an item and not measured.
   * Use this for a load-more sentinel that must not sit inside a feed.
   */
  footer?: React.ReactNode
}

export const VirtualList = forwardRef<VirtualListHandle, VirtualListProps>(function VirtualList(
  {
    itemCount = 0,
    itemHeight,
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
    footer,
    ...rest
  },
  ref
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const [, bumpMeasuredLayout] = useReducer((count: number) => count + 1, 0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<number, HTMLDivElement>())
  const cleanups = useRef(new Map<number, () => void>())
  const dynamicStrategyRef = useRef<VirtualListSizeStrategy | null>(null)
  const variableStrategyRef = useRef<VirtualListSizeStrategy | null>(null)
  const fixedStrategyRef = useRef<VirtualListSizeStrategy | null>(null)
  const fixedHeightRef = useRef<number | null>(null)
  const lastEstimatedRef = useRef<number | undefined>(undefined)
  const getItemHeightRef = useRef(getItemHeight)
  getItemHeightRef.current = getItemHeight
  const pendingAlignRef = useRef<{ index: number; align: VirtualScrollAlign } | null>(null)
  const activeIndexRef = useRef(0)

  const fixedHeight = itemHeight != null && estimatedItemHeight == null && !getItemHeight && !customStrategy
  const dynamicEstimate = estimatedItemHeight ?? (fixedHeight || getItemHeight || customStrategy ? undefined : 40)

  let strategy: VirtualListSizeStrategy
  if (customStrategy) {
    dynamicStrategyRef.current = null
    variableStrategyRef.current = null
    strategy = customStrategy
  } else if (getItemHeight) {
    dynamicStrategyRef.current = null
    if (!variableStrategyRef.current) {
      variableStrategyRef.current = variableSizeStrategy(
        (index) => getItemHeightRef.current?.(index) ?? 0,
        itemCount
      )
    } else {
      variableStrategyRef.current.syncHeights?.(
        (index) => getItemHeightRef.current?.(index) ?? 0,
        itemCount
      )
    }
    strategy = variableStrategyRef.current
  } else if (dynamicEstimate != null) {
    variableStrategyRef.current = null
    if (!dynamicStrategyRef.current || lastEstimatedRef.current !== dynamicEstimate) {
      dynamicStrategyRef.current = dynamicSizeStrategy(dynamicEstimate, itemCount)
      lastEstimatedRef.current = dynamicEstimate
    }
    strategy = dynamicStrategyRef.current
  } else {
    dynamicStrategyRef.current = null
    variableStrategyRef.current = null
    const pinned = itemHeight ?? 40
    if (!fixedStrategyRef.current || fixedHeightRef.current !== pinned) {
      fixedStrategyRef.current = fixedSizeStrategy(pinned)
      fixedHeightRef.current = pinned
    }
    strategy = fixedStrategyRef.current
  }

  const canMeasure = typeof strategy.updateItemHeight === 'function'
  const viewport = resolveScrollportViewport(clientHeight, height)
  const range = strategy.getRange(scrollTop, viewport, itemCount, overscan)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const read = () => {
      const next = el.clientHeight
      setClientHeight((current) => (current === next ? current : next))
    }
    read()
    return observeSize(el, read)
  }, [height])

  useLayoutEffect(() => {
    if (!canMeasure || !strategy.updateItemHeight) return undefined
    const keys = new Map<number, string | number>()
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      keys.set(i, getItemKey ? getItemKey(i) : i)
    }
    strategy.setItemKeys?.(
      Array.from({ length: itemCount }, (_, index) => (getItemKey ? getItemKey(index) : index))
    )
    const anchorIndex = range.startIndex >= 0 ? range.startIndex : 0
    const anchorKey = keys.get(anchorIndex) ?? anchorIndex
    strategy.noteAnchor?.(anchorKey, scrollTop)
    let changed = false
    itemRefs.current.forEach((el, index) => {
      if (!el) return
      const measured = readMarginBoxBlockSize(el)
      if (measured > 0 && measured !== strategy.getItemHeight(index)) {
        strategy.updateItemHeight?.(index, measured, keys.get(index))
        changed = true
      }
    })
    const corrected = strategy.consumeAnchorScrollTop?.()
    if (corrected != null && Math.abs(corrected - scrollTop) > 0.5) {
      const node = containerRef.current
      if (node) node.scrollTop = corrected
      setScrollTop(corrected)
      changed = true
    }
    const pending = pendingAlignRef.current
    if (pending) {
      pendingAlignRef.current = null
      const offset = strategy.getItemOffset(pending.index)
      const size = strategy.getItemHeight(pending.index)
      const next = scrollTopForVirtualAlign({
        scrollTop: containerRef.current?.scrollTop ?? scrollTop,
        viewport,
        offset,
        size,
        align: pending.align
      })
      if (containerRef.current && containerRef.current.scrollTop !== next) {
        containerRef.current.scrollTop = next
      }
      if (next !== scrollTop) setScrollTop(next)
    }
    if (changed) bumpMeasuredLayout()
    return undefined
  }, [canMeasure, getItemKey, itemCount, range.endIndex, range.startIndex, scrollTop, strategy, viewport])

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
      scrollToIndex(index: number, align: VirtualScrollAlign = 'start') {
        const safe = Number.isFinite(index) ? Math.floor(index) : 0
        const clamped = Math.max(0, Math.min(Math.max(itemCount - 1, 0), safe))
        pendingAlignRef.current = { index: clamped, align }
        activeIndexRef.current = clamped
        const next = scrollTopForVirtualAlign({
          scrollTop: containerRef.current?.scrollTop ?? scrollTop,
          viewport,
          offset: strategy.getItemOffset(clamped),
          size: strategy.getItemHeight(clamped),
          align
        })
        applyScrollTop(next)
      },
      scrollToOffset(offset: number) {
        applyScrollTop(Number.isFinite(offset) ? offset : 0)
      },
      getScrollElement() {
        return containerRef.current
      }
    }),
    [applyScrollTop, itemCount, scrollTop, strategy, viewport]
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
            cleanups.current.get(index)?.()
            cleanups.current.delete(index)
            if (!el) {
              itemRefs.current.delete(index)
              return
            }
            itemRefs.current.set(index, el)
            cleanups.current.set(
              index,
              observeSize(el, () => {
                const measured = readMarginBoxBlockSize(el)
                if (measured > 0) {
                  strategy.updateItemHeight?.(index, measured, getItemKey ? getItemKey(index) : index)
                  bumpMeasuredLayout()
                }
              })
            )
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
          style={
            getItemHeight
              ? { width: '100%' }
              : { height: `${itemH}px`, width: '100%', minHeight: `${itemH}px` }
          }>
          {renderItem({ index: i })}
        </div>
      )
    }
  }

  const namedAriaLabel =
    ariaLabel ?? (typeof rest['aria-label'] === 'string' ? rest['aria-label'] : undefined)
  const keyboardScroll = Boolean(namedAriaLabel)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardScroll || event.target !== event.currentTarget) return
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return
    }
    event.preventDefault()
    const current = activeIndexRef.current
    const next =
      event.key === 'End'
        ? Math.max(0, itemCount - 1)
        : event.key === 'Home'
          ? 0
          : event.key === 'ArrowDown'
            ? Math.min(Math.max(itemCount - 1, 0), current + 1)
            : Math.max(0, current - 1)
    activeIndexRef.current = next
    const aligned = scrollTopForVirtualAlign({
      scrollTop,
      viewport,
      offset: strategy.getItemOffset(next),
      size: strategy.getItemHeight(next),
      align: 'auto'
    })
    applyScrollTop(aligned)
  }

  if (fixedHeight) {
    itemRefs.current.forEach((el) => {
      const content = el.scrollHeight
      warnFixedRowOverflow('VirtualList.itemHeight', content, itemHeight ?? 0)
    })
  }

  return (
    <div
      {...rest}
      ref={containerRef}
      role={resolvedRole}
      tabIndex={keyboardScroll ? 0 : undefined}
      aria-label={namedAriaLabel}
      className={classNames(virtualListContainerClasses, className)}
      style={{ ...style, height: `${height}px` }}
      onScroll={handleScroll}
      onKeyDown={keyboardScroll ? handleKeyDown : undefined}>
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
      {footer}
    </div>
  )
})

VirtualList.displayName = 'VirtualList'
