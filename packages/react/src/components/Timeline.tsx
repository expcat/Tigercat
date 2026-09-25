import React, { useEffect, useMemo, useRef } from 'react'
import {
  EMPTY_TIMELINE_ITEMS,
  classNames,
  getPendingDotClasses,
  getTimelineAxisClasses,
  getTimelineContainerClasses,
  getTimelineContentClasses,
  getTimelineDotClasses,
  getTimelineHeadClasses,
  getTimelineItemClasses,
  getTimelineItemKey,
  getTimelineTailClasses,
  manageLiveRegion,
  mergeTigerLocale,
  processTimelineItems,
  resolveLocaleText,
  timelineDescriptionClasses,
  timelineHorizontalLabelClasses,
  timelineLabelClasses,
  timelineLabelSide,
  timelineListClasses,
  type TimelineItem,
  type TimelineItemPosition,
  type TimelineMode,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface TimelineProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  items?: TimelineItem[]
  /**
   * @default 'left'
   */
  mode?: TimelineMode
  /**
   * Append a pending item after the (optionally reversed) list.
   * Pending stays at the DOM end even when `reverse` is set.
   */
  pending?: boolean
  pendingDot?: React.ReactNode
  pendingContent?: React.ReactNode
  reverse?: boolean
  renderItem?: (item: TimelineItem, index: number) => React.ReactNode
  /**
   * Custom dot. Pending items prefer `pendingDot` unless this renderer
   * is the only source.
   */
  renderDot?: (item: TimelineItem, options: { pending: boolean }) => React.ReactNode
  className?: string
  locale?: Partial<TigerLocale>
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  mode = 'left',
  pending = false,
  pendingDot,
  pendingContent,
  reverse = false,
  renderItem,
  renderDot: customRenderDot,
  className,
  locale,
  ...ulProps
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const processedItems = useMemo(
    () => processTimelineItems(items ?? EMPTY_TIMELINE_ITEMS, { reverse, mode }),
    [items, reverse, mode]
  )

  const pendingText = resolveLocaleText(
    'Loading...',
    mergedLocale?.timeline?.pendingText,
    mergedLocale?.common?.loadingText
  )
  const pendingSignature = pending ? String(pendingContent ?? pendingText) : ''
  const pendingSeen = useRef<string | null>(null)
  const liveRef = useRef<ReturnType<typeof manageLiveRegion> | null>(null)
  useEffect(() => {
    const region = manageLiveRegion('polite')
    liveRef.current = region
    return () => {
      region.destroy()
      liveRef.current = null
    }
  }, [])
  useEffect(() => {
    const previous = pendingSeen.current
    if (previous === pendingSignature) return
    pendingSeen.current = pendingSignature
    if (!liveRef.current) return
    if (previous === null && !pendingSignature) return
    if (pendingSignature) liveRef.current.announce(pendingSignature)
    else if (previous) {
      liveRef.current.announce(mergedLocale?.timeline?.pendingReplacedText || 'Update finished')
    }
  }, [mergedLocale?.timeline?.pendingReplacedText, pendingSignature])

  const containerClasses = useMemo(
    () => classNames(getTimelineContainerClasses(mode), timelineListClasses, className),
    [mode, className]
  )

  const wrapCustomDot = (node: React.ReactNode) => (
    <div className={getTimelineDotClasses(undefined, true)}>{node}</div>
  )

  const renderDotElement = (item: TimelineItem, isPending = false): React.ReactNode => {
    if (isPending && pendingDot) {
      return wrapCustomDot(pendingDot)
    }
    if (customRenderDot) {
      return wrapCustomDot(customRenderDot(item, { pending: isPending }))
    }
    if (item.dot) return wrapCustomDot(item.dot as React.ReactNode)

    if (isPending) {
      return <div className={getPendingDotClasses()} />
    }

    const dotClasses = getTimelineDotClasses(item.color)
    const dotStyle = item.color ? { backgroundColor: item.color } : {}

    return <div className={dotClasses} style={dotStyle} />
  }

  const renderRail = (dot: React.ReactNode, isFirst: boolean, isLast: boolean) => {
    const head = <div className={getTimelineHeadClasses(mode)}>{dot}</div>
    const tail = (segment: 'before' | 'after', omitStroke: boolean) => (
      <div
        className={getTimelineTailClasses(mode, omitStroke, segment)}
        data-timeline-tail={segment}
        aria-hidden="true"
      />
    )
    return (
      <div className={getTimelineAxisClasses(mode)} data-timeline-axis={mode}>
        {mode === 'horizontal' ? (
          <>
            {tail('before', isFirst)}
            {head}
            {tail('after', isLast)}
          </>
        ) : (
          <>
            {head}
            {isLast ? null : tail('after', false)}
          </>
        )}
      </div>
    )
  }

  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const key = getTimelineItemKey(item, index)
    const isFirst = index === 0
    const isLast = index === processedItems.length - 1 && !pending
    const position = item.position as TimelineItemPosition | undefined

    const itemClasses = getTimelineItemClasses(mode, position, isLast)
    const contentClasses = getTimelineContentClasses(mode, position)
    const rail = renderRail(renderDotElement(item), isFirst, isLast)

    if (renderItem) {
      return (
        <li key={key} className={itemClasses}>
          {rail}
          <div className={contentClasses}>{renderItem(item, index)}</div>
        </li>
      )
    }

    const contentSide = mode === 'right' ? 'start' : 'end'
    const labelSide = timelineLabelSide(
      mode === 'horizontal' ? 'horizontal' : 'vertical',
      contentSide
    )
    const labelNode = item.label ? (
      <time
        className={mode === 'horizontal' ? timelineHorizontalLabelClasses : timelineLabelClasses}
        dateTime={String(item.label)}
        data-timeline-label-side={labelSide}>
        {item.label}
      </time>
    ) : null
    return (
      <li key={key} className={itemClasses} data-timeline-mode={mode}>
        {labelSide === 'start' ? labelNode : null}
        {rail}
        <div className={contentClasses}>
          {(item.content as React.ReactNode) ? (
            <div className={timelineDescriptionClasses}>{item.content as React.ReactNode}</div>
          ) : null}
        </div>
        {labelSide === 'end' ? labelNode : null}
      </li>
    )
  }

  const renderPendingItem = () => {
    if (!pending) {
      return null
    }

    const index = processedItems.length
    const position =
      mode === 'alternate'
        ? ((index % 2 === 0 ? 'left' : 'right') as TimelineItemPosition)
        : undefined

    const itemClasses = getTimelineItemClasses(mode, position, true)
    const contentClasses = getTimelineContentClasses(mode, position)
    const rail = renderRail(renderDotElement({}, true), index === 0, true)
    const pendingText = resolveLocaleText(
      'Loading...',
      mergedLocale?.timeline?.pendingText,
      mergedLocale?.common?.loadingText
    )

    return (
      <li key="pending" className={itemClasses} aria-busy="true">
        {rail}
        <div className={contentClasses}>
          {pendingContent || <div className={timelineDescriptionClasses}>{pendingText}</div>}
        </div>
      </li>
    )
  }

  return (
    <ul {...ulProps} className={containerClasses} role="list" aria-busy={ulProps['aria-busy']}>
      {processedItems.map((item, index) => renderTimelineItem(item, index))}
      {renderPendingItem()}
    </ul>
  )
}
