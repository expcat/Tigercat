import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  classNames,
  shouldLoadMore,
  getInfiniteScrollContainerClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses
} from '@expcat/tigercat-core'

export interface InfiniteScrollProps {
  hasMore?: boolean
  loading?: boolean
  threshold?: number
  loadingText?: string
  endText?: string
  direction?: 'vertical' | 'horizontal'
  inverse?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  loader?: React.ReactNode
  end?: React.ReactNode
  onLoadMore?: () => void
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore = true,
  loading = false,
  threshold = 100,
  loadingText = 'Loading...',
  endText = 'No more data',
  direction = 'vertical',
  inverse = false,
  disabled = false,
  className,
  children,
  loader,
  end,
  onLoadMore,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const containerClasses = useMemo(
    () => getInfiniteScrollContainerClasses(direction, className),
    [direction, className]
  )

  const checkScroll = useCallback(() => {
    if (disabled || loading || !hasMore) return
    const el = containerRef.current
    if (!el) return

    if (shouldLoadMore(el, threshold, direction, inverse)) {
      onLoadMore?.()
    }
  }, [disabled, loading, hasMore, threshold, direction, inverse, onLoadMore])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const loaderEl = loading ? (
    <div className={infiniteScrollLoaderClasses} role="status" aria-live="polite">
      {loader ?? loadingText}
    </div>
  ) : null

  const endEl =
    !hasMore && !loading ? <div className={infiniteScrollEndClasses}>{end ?? endText}</div> : null

  return (
    <div ref={containerRef} className={classNames(containerClasses)} {...rest}>
      {inverse ? (
        <>
          {loaderEl}
          {children}
          {endEl}
        </>
      ) : (
        <>
          {children}
          {loaderEl}
          {endEl}
        </>
      )}
    </div>
  )
}

export default InfiniteScroll
