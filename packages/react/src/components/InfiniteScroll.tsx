import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { InfiniteScrollProps as CoreInfiniteScrollProps } from '@expcat/tigercat-core'
import {
  classNames,
  shouldLoadMore,
  createInfiniteScrollObserver,
  createInfiniteScrollFlight,
  infiniteScrollContainerCanAdvance,
  compensateInverseScrollStart,
  resolveLocaleText,
  mergeTigerLocale,
  getInfiniteScrollContainerClasses,
  getInfiniteScrollSentinelStyle,
  getInfiniteScrollChromeClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses,
  infiniteScrollSentinelClasses
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface InfiniteScrollProps
  extends CoreInfiniteScrollProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: React.ReactNode
  loader?: React.ReactNode
  end?: React.ReactNode
  onLoadMore?: () => void | Promise<unknown>
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore = true,
  loading = false,
  error = false,
  errorText,
  retryText,
  threshold = 100,
  loadingText,
  endText,
  orientation = 'vertical',
  inverse = false,
  disabled = false,
  height,
  root = null,
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
  const flightRef = useRef(createInfiniteScrollFlight())
  const wasLoadingRef = useRef(loading)
  const anchorStartRef = useRef<number | null>(null)

  const containerClasses = useMemo(
    () => getInfiniteScrollContainerClasses(orientation, className),
    [orientation, className]
  )

  const requestLoad = useCallback(() => {
    const el = containerRef.current
    const containerRoot = root === 'container' || root === undefined
    if (containerRoot && el && !infiniteScrollContainerCanAdvance(el, orientation)) {
      return
    }
    if (!flightRef.current.canRequest({ disabled, hasMore, error, loading })) return
    const result = onLoadMoreRef.current?.()
    flightRef.current.begin(result)
  }, [disabled, error, hasMore, loading, orientation, root])

  useEffect(() => {
    flightRef.current.noteLoading(loading, wasLoadingRef.current)
    wasLoadingRef.current = loading
  }, [loading])

  useEffect(() => {
    if (error) flightRef.current.noteError()
  }, [error])

  const resolveObserverRoot = useCallback((): Element | null => {
    if (root === 'container' || root === undefined) return containerRef.current
    return root
  }, [root])

  const checkScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (shouldLoadMore(el, threshold, orientation, inverse, dir)) requestLoad()
  }, [threshold, orientation, inverse, dir, requestLoad])

  useEffect(() => {
    if (disabled || !hasMore) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observerRoot = resolveObserverRoot()
    const teardown = createInfiniteScrollObserver(sentinel, {
      threshold,
      orientation,
      root: observerRoot,
      inverse,
      dir,
      onLoadMore: () => {
        flightRef.current.noteSentinel(true)
        requestLoad()
      },
      onLeave: () => flightRef.current.noteSentinel(false)
    })

    if (teardown) {
      const el = containerRef.current
      if (observerRoot && observerRoot === el) checkScroll()
      return teardown
    }

    const scrollTarget: EventTarget | null = observerRoot === null ? window : containerRef.current
    if (scrollTarget) {
      scrollTarget.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
      return () => scrollTarget.removeEventListener('scroll', checkScroll)
    }
  }, [
    disabled,
    loading,
    hasMore,
    threshold,
    orientation,
    inverse,
    requestLoad,
    resolveObserverRoot,
    checkScroll,
    dir
  ])

  useLayoutEffect(() => {
    if (!inverse) {
      anchorStartRef.current = null
      return
    }
    const el = containerRef.current
    if (!el) return
    const content = Array.from(el.children).find((child) => {
      if (!(child instanceof HTMLElement)) return false
      if (child.classList.contains(infiniteScrollSentinelClasses)) return false
      if (child.getAttribute('role') === 'status' || child.getAttribute('role') === 'alert')
        return false
      return true
    }) as HTMLElement | undefined
    if (!content) return
    const nextStart = orientation === 'horizontal' ? content.offsetLeft : content.offsetTop
    const next = compensateInverseScrollStart({
      orientation,
      dir,
      previousStart: anchorStartRef.current,
      nextStart,
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft
    })
    if (next.scrollTop !== el.scrollTop) el.scrollTop = next.scrollTop
    if (next.scrollLeft !== el.scrollLeft) el.scrollLeft = next.scrollLeft
    anchorStartRef.current = orientation === 'horizontal' ? content.offsetLeft : content.offsetTop
  })

  const sentinelEl = hasMore ? (
    <div
      ref={sentinelRef}
      className={infiniteScrollSentinelClasses}
      aria-hidden="true"
      style={getInfiniteScrollSentinelStyle(orientation)}
    />
  ) : null

  const loaderEl = loading ? (
    <div
      className={getInfiniteScrollChromeClasses(orientation, infiniteScrollLoaderClasses)}
      role="status"
      aria-live="polite">
      {loader ?? resolveLocaleText('Loading...', loadingText, mergedLocale?.common?.loadingText)}
    </div>
  ) : null

  const endName = resolveLocaleText('No more data', endText, mergedLocale?.common?.noMoreText)
  const errorName = resolveLocaleText('Could not load more', errorText, errorText)
  const retryName = resolveLocaleText('Retry', retryText, retryText)
  const endEl =
    !hasMore && !loading && !error ? (
      <div
        className={getInfiniteScrollChromeClasses(orientation, infiniteScrollEndClasses)}
        role="status"
        aria-live="polite"
        aria-label={endName}>
        {end ?? endName}
      </div>
    ) : null
  const errorEl = error ? (
    <div
      className={getInfiniteScrollChromeClasses(orientation, infiniteScrollEndClasses)}
      role="alert"
      aria-label={errorName}>
      <span>{errorName}</span>
      <button
        type="button"
        onClick={() => {
          flightRef.current.reset()
          const result = onLoadMoreRef.current?.()
          flightRef.current.begin(result)
        }}>
        {retryName}
      </button>
    </div>
  ) : null

  const chrome = (
    <>
      {sentinelEl}
      {loaderEl}
      {errorEl}
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
