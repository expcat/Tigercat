import { useLayoutEffect, useRef, useState } from 'react'
import {
  getAutoCompleteAlignScrollTop,
  getAutoCompleteVirtualRange,
  type VirtualRange
} from '@expcat/tigercat-core'

/** Fixed-height picker window. Arithmetic is `fixedSizeStrategy` via the auto-complete helpers. */
export function useFixedVirtualWindow(options: {
  enabled: boolean
  activeIndex: number
  itemHeight: number
  viewport: number
  count: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!options.enabled) return
    const next = getAutoCompleteAlignScrollTop(
      scrollRef.current,
      options.activeIndex,
      options.itemHeight,
      options.viewport
    )
    scrollRef.current = next
    setScrollTop((current) => (current === next ? current : next))
    const el = scrollerRef.current
    if (el && el.scrollTop !== next) el.scrollTop = next
  }, [options.activeIndex, options.count, options.enabled, options.itemHeight, options.viewport])

  const range: VirtualRange | null = options.enabled
    ? getAutoCompleteVirtualRange(scrollTop, options.viewport, options.count, options.itemHeight)
    : null
  const activeInWindow =
    !options.enabled ||
    (range != null &&
      options.activeIndex >= range.startIndex &&
      options.activeIndex <= range.endIndex)

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const top = event.currentTarget.scrollTop
    scrollRef.current = top
    setScrollTop(top)
  }

  return { scrollerRef, range, activeInWindow, onScroll }
}
