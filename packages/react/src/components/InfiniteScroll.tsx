import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { InfiniteScrollProps as CoreInfiniteScrollProps } from '@expcat/tigercat-core'
import {
  classNames,
  shouldLoadMore,
  createInfiniteScrollObserver,
  resolveLocaleText,
  mergeTigerLocale,
  getInfiniteScrollContainerClasses,
  getInfiniteScrollSentinelStyle,
  getInfiniteScrollChromeClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses,
  infiniteScrollSentinelClasses
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface InfiniteScrollProps
  extends CoreInfiniteScrollProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
  height,
  root = 'container',
  className,
  locale,
  children,
  loader,
  end,
  onLoadMore,
  style,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const dir = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore
  const pendingRef = useRef(false)
  const wasLoadingRef = useRef(loading)
  const prevScrollHeightRef = useRef<number | null>(null)

  const containerClasses = useMemo(
    () => getInfiniteScrollContainerClasses(direction, className),
    [direction, className]
  )

  const requestLoad = useCallback(() => {
    if (disabled || loading || !hasMore || pendingRef.current) return
    pendingRef.current = true
    onLoadMoreRef.current?.()
  }, [disabled, loading, hasMore])

  useEffect(() => {
    if (wasLoadingRef.current && !loading) pendingRef.current = false
    if (loading) pendingRef.current = true
    wasLoadingRef.current = loading
  }, [loading])

  const resolveObserverRoot = useCallback((): Element | null => {
    if (root === 'container' || root === undefined) return containerRef.current
    return root
  }, [root])

  const checkScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (shouldLoadMore(el, threshold, direction, inverse, dir)) requestLoad()
  }, [threshold, direction, inverse, dir, requestLoad])

  useEffect(() => {
    if (disabled || !hasMore) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observerRoot = resolveObserverRoot()
    const teardown = createInfiniteScrollObserver(sentinel, {
      threshold,
      direction,
      root: observerRoot,
      inverse,
      onLoadMore: requestLoad
    })

    if (teardown) {
      const el = containerRef.current
      if (observerRoot && observerRoot === el) checkScroll()
      return teardown
    }

    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [
    disabled,
    loading,
    hasMore,
    threshold,
    direction,
    inverse,
    requestLoad,
    resolveObserverRoot,
    checkScroll
  ])

  useLayoutEffect(() => {
    if (!inverse) return
    const el = containerRef.current
    if (!el) return
    const next = el.scrollHeight
    const prev = prevScrollHeightRef.current
    if (prev != null && next !== prev) el.scrollTop += next - prev
    prevScrollHeightRef.current = next
  })

  const sentinelEl = hasMore ? (
    <div
      ref={sentinelRef}
      className={infiniteScrollSentinelClasses}
      aria-hidden="true"
      style={getInfiniteScrollSentinelStyle(direction)}
    />
  ) : null

  const loaderEl = loading ? (
    <div
      className={getInfiniteScrollChromeClasses(direction, infiniteScrollLoaderClasses)}
      role="status"
      aria-live="polite">
      {loader ?? resolveLocaleText('Loading...', loadingText, mergedLocale?.common?.loadingText)}
    </div>
  ) : null

  const endEl =
    !hasMore && !loading ? (
      <div
        className={getInfiniteScrollChromeClasses(direction, infiniteScrollEndClasses)}
        aria-live="polite">
        {end ?? resolveLocaleText('No more data', endText, mergedLocale?.common?.noMoreText)}
      </div>
    ) : null

  const chrome = (
    <>
      {sentinelEl}
      {loaderEl}
      {endEl}
    </>
  )

  return (
    <div
      {...rest}
      ref={containerRef}
      className={classNames(containerClasses)}
      style={{ ...style, ...(height !== undefined ? { height: `${height}px` } : {}) }}
      aria-busy={loading || undefined}>
      {inverse ? (
        <>
          {chrome}
          {children}
        </>
      ) : (
        <>
          {children}
          {chrome}
        </>
      )}
    </div>
  )
}

export default InfiniteScroll
