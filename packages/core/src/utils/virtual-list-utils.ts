import { classNames } from './class-names'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const virtualListContainerClasses = classNames(
  'overflow-auto relative',
  'bg-[var(--tiger-virtuallist-bg,var(--tiger-surface,#ffffff))]'
)

export const virtualListInnerClasses = 'relative w-full'

/* ------------------------------------------------------------------ */
/*  Range calculation                                                  */
/* ------------------------------------------------------------------ */

export interface VirtualRange {
  startIndex: number
  endIndex: number
  offsetTop: number
  totalHeight: number
}

/**
 * Calculate visible range for fixed-height items
 */
export function getFixedVirtualRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number
): VirtualRange {
  const totalHeight = itemCount * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + 2 * overscan)
  const offsetTop = startIndex * itemHeight

  return { startIndex, endIndex, offsetTop, totalHeight }
}
