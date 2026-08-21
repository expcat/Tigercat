import React, {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react'
import {
  classNames,
  computeMasonryColumnHeights,
  distributeMasonryItems,
  getMasonryColumnClasses,
  getMasonryColumnStyle,
  getMasonryGapStyle,
  getMasonryItemClasses,
  getMasonryRootClasses,
  moduloDistributeMasonryItems,
  observeScrollAreaSize,
  readMasonryItemHeight,
  resolveMasonryColumnCount,
  resolveMasonryGap,
  MASONRY_DEFAULT_COLUMNS,
  MASONRY_DEFAULT_GAP,
  type MasonryInstance,
  type MasonryLayoutDetail,
  type MasonryProps as CoreMasonryProps
} from '@expcat/tigercat-core'

export interface MasonryProps
  extends CoreMasonryProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Fired after the layout is (re)computed */
  onLayout?: (detail: MasonryLayoutDetail) => void
}

function childSignature(nodes: Array<React.ReactNode>): string {
  return nodes
    .map(
      (node, index) =>
        `${index}:${typeof node === 'object' && node !== null && 'key' in node ? String(node.key ?? '') : String(node)}`
    )
    .join('\u0000')
}

function sameHeights(previous: number[], next: number[]): boolean {
  return (
    previous.length === next.length && previous.every((height, index) => height === next[index])
  )
}

function subscribeToResize(onChange: () => void): () => void {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

const noopSubscribe = () => () => undefined

export const Masonry = forwardRef<MasonryInstance, MasonryProps>(
  (
    {
      columns = MASONRY_DEFAULT_COLUMNS,
      gap = MASONRY_DEFAULT_GAP,
      className,
      columnClassName,
      itemClassName,
      children,
      onLayout,
      style,
      ...rest
    },
    ref
  ) => {
    const itemRefs = useRef(new Map<number, HTMLDivElement>())
    const heightsRef = useRef<number[]>([])
    const lastSignatureRef = useRef('')
    const onLayoutRef = useRef(onLayout)
    onLayoutRef.current = onLayout
    const [distribution, setDistribution] = useState<number[][]>([])

    const childNodes = useMemo(() => Children.toArray(children), [children])
    const signature = childSignature(childNodes)

    const isResponsive = typeof columns === 'object' || typeof gap === 'object'

    const subscribe = useMemo(
      () => (isResponsive ? subscribeToResize : noopSubscribe),
      [isResponsive]
    )
    const windowWidth = useSyncExternalStore(
      subscribe,
      () => window.innerWidth,
      () => 1024
    )

    const columnCount = resolveMasonryColumnCount(columns, windowWidth)
    const gapPx = resolveMasonryGap(gap, windowWidth)

    const relayout = useCallback(() => {
      const elements = itemRefs.current
      const indices = Array.from(elements.keys())
      const maxIndex = indices.length > 0 ? Math.max(...indices) : -1
      const nextHeights: number[] = []
      for (let index = 0; index <= maxIndex; index++) {
        const element = elements.get(index)
        nextHeights.push(element ? readMasonryItemHeight(element) : 0)
      }

      // ResizeObserver fires once per (re)observe — bail out when neither the
      // item set nor any height changed, so observation never loops.
      const countChanged = nextHeights.length !== heightsRef.current.length
      if (!countChanged && sameHeights(heightsRef.current, nextHeights)) return

      heightsRef.current = nextHeights
      const nextDistribution = distributeMasonryItems(nextHeights, columnCount)
      setDistribution(nextDistribution)
      onLayoutRef.current?.({
        columnCount,
        columnHeights: computeMasonryColumnHeights(nextHeights, nextDistribution, gapPx)
      })
    }, [columnCount, gapPx])

    useEffect(() => {
      // Children changed → re-measure; only the width changed → reuse cached
      // heights and redistribute.
      if (lastSignatureRef.current !== signature) {
        lastSignatureRef.current = signature
        relayout()
        return
      }
      if (heightsRef.current.length === 0) return

      const nextDistribution = distributeMasonryItems(heightsRef.current, columnCount)
      setDistribution(nextDistribution)
      onLayoutRef.current?.({
        columnCount,
        columnHeights: computeMasonryColumnHeights(heightsRef.current, nextDistribution, gapPx)
      })
    }, [signature, columnCount, gapPx, relayout])

    // Re-observe whenever the rendered item set changes: new elements need a
    // fresh observer and removed elements must be released.
    useEffect(() => {
      if (childNodes.length === 0) return
      return observeScrollAreaSize(Array.from(itemRefs.current.values()), relayout)
    }, [signature, distribution, relayout, childNodes.length])

    useImperativeHandle(
      ref,
      () => ({
        relayout,
        getColumnCount: () => columnCount
      }),
      [relayout, columnCount]
    )

    // Until the post-render measurement catches up, fall back to round-robin
    // so inserted items are never dropped and removed wrappers disappear.
    const activeDistribution =
      distribution.length > 0 && heightsRef.current.length === childNodes.length
        ? distribution
        : moduloDistributeMasonryItems(childNodes.length, columnCount)

    return (
      <div
        {...rest}
        className={classNames(getMasonryRootClasses(className))}
        style={{ ...getMasonryGapStyle(gapPx), ...style }}
        data-masonry="">
        {activeDistribution.map((indices, columnIndex) => (
          <div
            key={`column-${columnIndex}`}
            className={getMasonryColumnClasses(columnClassName)}
            style={getMasonryColumnStyle(gapPx)}
            data-masonry-column={columnIndex}>
            {indices.map((index) => (
              <div
                key={`item-${index}`}
                className={getMasonryItemClasses(itemClassName)}
                data-masonry-item={index}
                ref={(el) => {
                  if (el) itemRefs.current.set(index, el)
                  else itemRefs.current.delete(index)
                }}>
                {childNodes[index]}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
)

Masonry.displayName = 'Masonry'

export default Masonry
