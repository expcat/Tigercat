import React, { useState, useMemo, useRef, useCallback } from 'react'
import type { VirtualListProps as CoreVirtualListProps } from '@expcat/tigercat-core'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  getFixedVirtualRange,
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
  height = 400,
  overscan = 5,
  className,
  renderItem,
  onScroll
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const range = useMemo(
    () => getFixedVirtualRange(scrollTop, height, itemHeight, itemCount, overscan),
    [scrollTop, height, itemHeight, itemCount, overscan]
  )

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const st = containerRef.current.scrollTop
      setScrollTop(st)
      onScroll?.(st)
    }
  }, [onScroll])

  const { startIndex, endIndex, offsetTop, totalHeight } = range

  const items: React.ReactNode[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    items.push(
      <div key={i} style={{ height: `${itemHeight}px`, width: '100%' }}>
        {renderItem({ index: i })}
      </div>
    )
  }

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
