import React, {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  computeMasonryPositions,
  getMasonryFlowRootStyle,
  getMasonryItemClasses,
  getMasonryItemPositionStyle,
  getMasonryPackedRootStyle,
  getMasonryRootClasses,
  hasMeasuredMasonryHeights,
  isResponsiveMap,
  observeElementSize,
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

export const Masonry = forwardRef<MasonryInstance, MasonryProps>(function Masonry(
  {
    columns = MASONRY_DEFAULT_COLUMNS,
    gap = MASONRY_DEFAULT_GAP,
    className,
    columnClassName: _columnClassName,
    itemClassName,
    children,
    onLayout,
    style,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<number, HTMLDivElement>())
  const heightsRef = useRef<number[]>([])
  const lastSignatureRef = useRef('')
  const onLayoutRef = useRef(onLayout)
  onLayoutRef.current = onLayout
  const [containerWidth, setContainerWidth] = useState(0)
  const [heights, setHeights] = useState<number[]>([])

  const childNodes = useMemo(() => Children.toArray(children), [children])
  const signature = childSignature(childNodes)
  const isResponsive = isResponsiveMap(columns) || isResponsiveMap(gap)
  const widthForResolve = isResponsive ? containerWidth : 1024

  const columnCount = resolveMasonryColumnCount(columns, widthForResolve)
  const gapPx = resolveMasonryGap(gap, widthForResolve)
  const packed =
    hasMeasuredMasonryHeights(heights) && containerWidth > 0 && heights.length === childNodes.length
  const positions = packed
    ? computeMasonryPositions(heights, columnCount, gapPx, containerWidth)
    : []

  const emitLayout = useCallback(
    (nextHeights: number[]) => {
      const packedPositions = hasMeasuredMasonryHeights(nextHeights)
        ? computeMasonryPositions(nextHeights, columnCount, gapPx, containerWidth)
        : []
      const columnHeights = Array.from({ length: columnCount }, () => 0)
      packedPositions.forEach((position, index) => {
        const bottom = position.top + (nextHeights[index] || 0)
        if (bottom > columnHeights[position.column]) columnHeights[position.column] = bottom
      })
      onLayoutRef.current?.({ columnCount, columnHeights })
    },
    [columnCount, containerWidth, gapPx]
  )

  const measure = useCallback(() => {
    const nextHeights: number[] = childNodes.map((_, index) => {
      const element = itemRefs.current.get(index)
      return element ? readMasonryItemHeight(element) : 0
    })
    if (!sameHeights(heightsRef.current, nextHeights)) {
      heightsRef.current = nextHeights
      setHeights(nextHeights)
    }
    emitLayout(nextHeights)
  }, [childNodes, emitLayout])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    setContainerWidth(root.getBoundingClientRect().width)
    return observeElementSize(root, ({ width }) => setContainerWidth(width))
  }, [])

  useEffect(() => {
    if (lastSignatureRef.current !== signature) {
      lastSignatureRef.current = signature
      heightsRef.current = []
      setHeights([])
    }
    measure()
  }, [signature, columnCount, gapPx, containerWidth, measure])

  useEffect(() => {
    if (childNodes.length === 0) return undefined
    const items = Array.from(itemRefs.current.values())
    const stopRo = observeScrollAreaSize(items, measure)
    const medias = items.flatMap((el) => Array.from(el.querySelectorAll('img, video')))
    const onLoad = () => measure()
    for (const media of medias) {
      media.addEventListener('load', onLoad)
      media.addEventListener('error', onLoad)
    }
    return () => {
      stopRo()
      for (const media of medias) {
        media.removeEventListener('load', onLoad)
        media.removeEventListener('error', onLoad)
      }
    }
  }, [signature, measure, childNodes.length])

  useImperativeHandle(
    ref,
    () => ({
      relayout: measure,
      getColumnCount: () => columnCount
    }),
    [measure, columnCount]
  )

  const packedHeight = packed
    ? Math.max(0, ...positions.map((position, index) => position.top + (heights[index] || 0)))
    : 0

  const rootStyle = packed
    ? { ...getMasonryPackedRootStyle(packedHeight), ...style }
    : { ...getMasonryFlowRootStyle(columnCount, gapPx), ...style }

  const labelled = Boolean(rest['aria-label'] || rest['aria-labelledby'])

  return (
    <div
      {...rest}
      ref={rootRef}
      role={labelled ? 'list' : rest.role}
      className={classNames(getMasonryRootClasses(className))}
      style={rootStyle}
      data-masonry="">
      {childNodes.map((child, index) => {
        const key =
          typeof child === 'object' && child !== null && 'key' in child && child.key != null
            ? child.key
            : `item-${index}`
        return (
          <div
            key={key}
            role={labelled ? 'listitem' : undefined}
            className={getMasonryItemClasses(itemClassName)}
            style={
              packed && positions[index] ? getMasonryItemPositionStyle(positions[index]) : undefined
            }
            data-masonry-item={index}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el)
              else {
                const existing = itemRefs.current.get(index)
                if (!existing || !existing.isConnected) itemRefs.current.delete(index)
              }
            }}>
            {child}
          </div>
        )
      })}
    </div>
  )
})

Masonry.displayName = 'Masonry'

export default Masonry
