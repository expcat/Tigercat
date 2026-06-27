import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  classNames,
  shouldLoadMore,
  createInfiniteScrollObserver,
  resolveLocaleText,
  mergeTigerLocale,
  getInfiniteScrollContainerClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses,
  infiniteScrollSentinelClasses,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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
  locale?: Partial<TigerLocale>
  children?: React.ReactNode
  loader?: React.ReactNode
  end?: React.ReactNode
  onLoadMore?: () => void
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore = true,
  loading = false,
  threshold = 100,
  loadingText,
  endText,
  direction = 'vertical',
  inverse = false,
  disabled = false,
  className,
  locale,
  children,
  loader,
  end,
  onLoadMore,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const containerClasses = useMemo(
    () => getInfiniteScrollContainerClasses(direction, className),
    [direction, className]
  )

  // Stable callback ref to avoid re-creating observer on every render
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  // Fallback scroll handler (when IO unavailable)
  const checkScroll = useCallback(() => {
    if (disabled || loading || !hasMore) return
    const el = containerRef.current
    if (!el) return
    if (shouldLoadMore(el, threshold, direction, inverse)) {
      onLoadMoreRef.current?.()
    }
  }, [disabled, loading, hasMore, threshold, direction, inverse])

  useEffect(() => {
    if (disabled || !hasMore) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const teardown = createInfiniteScrollObserver(sentinel, {
      threshold,
      direction,
      root: containerRef.current,
      inverse,
      onLoadMore: () => {
        if (!disabled && !loading && hasMore) {
          onLoadMoreRef.current?.()
        }
      }
    })

    if (teardown) {
      return teardown
    }

    // IO unavailable — fall back to scroll events
    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [disabled, loading, hasMore, threshold, direction, inverse, checkScroll])

  const sentinelEl = hasMore ? (
    <div
      ref={sentinelRef}
      className={infiniteScrollSentinelClasses}
      aria-hidden="true"
      style={{ height: 0, overflow: 'hidden' }}
    />
  ) : null

  const loaderEl = loading ? (
    <div className={infiniteScrollLoaderClasses} role="status" aria-live="polite">
      {loader ?? resolveLocaleText('Loading...', loadingText, mergedLocale?.common?.loadingText)}
    </div>
  ) : null

  const endEl =
    !hasMore && !loading ? (
      <div className={infiniteScrollEndClasses}>
        {end ?? resolveLocaleText('No more data', endText, mergedLocale?.common?.noMoreText)}
      </div>
    ) : null

  return (
    <div ref={containerRef} className={classNames(containerClasses)} {...rest}>
      {inverse ? (
        <>
          {sentinelEl}
          {loaderEl}
          {children}
          {endEl}
        </>
      ) : (
        <>
          {children}
          {sentinelEl}
          {loaderEl}
          {endEl}
        </>
      )}
    </div>
  )
}

export default InfiniteScroll
