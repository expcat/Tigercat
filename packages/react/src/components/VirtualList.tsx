import React, { useState, useMemo, useRef, useCallback, useLayoutEffect } from 'react'
import type { VirtualListProps as CoreVirtualListProps } from '@expcat/tigercat-core'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  fixedSizeStrategy,
  variableSizeStrategy,
  dynamicSizeStrategy,
  classNames
} from '@expcat/tigercat-core'

export interface VirtualListProps extends CoreVirtualListProps {
  /** Render function for each item — receives { index } */
  renderItem: (info: { index: number }) => React.ReactNode
  /** Called on scroll */
  onScroll?: (scrollTop: number) => void
}

export const VirtualList: React.FC<VirtualListProps> = ({
  itemCount = 0,
  itemHeight = 40,
  estimatedItemHeight,
  getItemHeight,
  sizeStrategy: customStrategy,
  height = 400,
  overscan = 5,
  className,
  renderItem,
  onScroll
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  // Bumped after DOM measurement so the range/offsets recompute (dynamic mode).
  const [measureVersion, setMeasureVersion] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<number, HTMLDivElement>())

  // Dynamic mode measures real DOM heights and writes them back to the strategy.
  const isDynamic = !customStrategy && !getItemHeight && estimatedItemHeight !== undefined

  const strategy = useMemo(() => {
    if (customStrategy) return customStrategy
    if (getItemHeight) return variableSizeStrategy(getItemHeight, itemCount)
    if (estimatedItemHeight !== undefined)
      return dynamicSizeStrategy(estimatedItemHeight, itemCount)
    return fixedSizeStrategy(itemHeight)
  }, [customStrategy, getItemHeight, estimatedItemHeight, itemHeight, itemCount])

  const range = useMemo(
    () => strategy.getRange(scrollTop, height, itemCount, overscan),
    // measureVersion participates so re-measured heights recompute the window.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollTop, height, itemCount, overscan, strategy, measureVersion]
  )

  useLayoutEffect(() => {
    if (!isDynamic || !strategy.updateItemHeight) return
    let changed = false
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const measured = el.offsetHeight
      if (measured > 0 && measured !== strategy.getItemHeight(i)) {
        strategy.updateItemHeight!(i, measured)
        changed = true
      }
    })
    if (changed) setMeasureVersion((v) => v + 1)
  }, [isDynamic, strategy])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const st = containerRef.current.scrollTop
      setScrollTop(st)
      onScroll?.(st)
    }
  }, [onScroll])

  const { startIndex, endIndex, totalHeight } = range

  const items: React.ReactNode[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    const itemH = strategy.getItemHeight(i)
    if (isDynamic) {
      // Auto height so the content's real height can be measured back.
      const index = i
      items.push(
        <div
          key={index}
          ref={(el) => {
            if (el) itemRefs.current.set(index, el)
            else itemRefs.current.delete(index)
          }}
          style={{ width: '100%' }}>
          {renderItem({ index })}
        </div>
      )
    } else {
      items.push(
        <div key={i} style={{ height: `${itemH}px`, width: '100%' }}>
          {renderItem({ index: i })}
        </div>
      )
    }
  }

  const offsetTop = startIndex >= 0 ? strategy.getItemOffset(startIndex) : 0

  return (
    <div
      ref={containerRef}
      className={classNames(virtualListContainerClasses, className)}
      style={{ height: `${height}px` }}
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
}
