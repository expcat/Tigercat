import React from 'react'
import {
  classNames,
  getTimelineContainerClasses,
  getTimelineItemClasses,
  getTimelineTailClasses,
  getTimelineHeadClasses,
  getTimelineDotClasses,
  getTimelineContentClasses,
  getPendingDotClasses,
  timelineListClasses,
  timelineLabelClasses,
  timelineDescriptionClasses,
  type TimelineMode,
  type TimelineItem,
  type TimelineItemPosition
} from '@expcat/tigercat-core'

export interface TimelineProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /**
   * Timeline data source
   */
  items?: TimelineItem[]
  /**
   * Timeline mode/direction
   * @default 'left'
   */
  mode?: TimelineMode
  /**
   * Whether to show pending state
   * @default false
   */
  pending?: boolean
  /**
   * Pending item dot content
   */
  pendingDot?: React.ReactNode
  /**
   * Custom pending content
   */
  pendingContent?: React.ReactNode
  /**
   * Whether to reverse the timeline order
   * @default false
   */
  reverse?: boolean
  /**
   * Custom render function for timeline items
   */
  renderItem?: (item: TimelineItem, index: number) => React.ReactNode
  /**
   * Custom render function for dot
   */
  renderDot?: (item: TimelineItem) => React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({
  items = [],
  mode = 'left',
  pending = false,
  pendingDot,
  pendingContent,
  reverse = false,
  renderItem,
  renderDot: customRenderDot,
  className,
  ...ulProps
}) => {
  let processedItems = [...items]
  if (reverse) processedItems = processedItems.reverse()
  if (mode === 'alternate') {
    processedItems = processedItems.map((item, index) => ({
      ...item,
      position: (item.position || (index % 2 === 0 ? 'left' : 'right')) as TimelineItemPosition
    }))
  }

  const containerClasses = classNames(
    getTimelineContainerClasses(mode),
    timelineListClasses,
    className
  )

  const getItemKey = (item: TimelineItem, index: number): string | number => item.key || index

  const wrapCustomDot = (node: React.ReactNode) => (
    <div className={getTimelineDotClasses(undefined, true)}>{node}</div>
  )

  const renderDotElement = (item: TimelineItem, isPending = false): React.ReactNode => {
    if (customRenderDot) return wrapCustomDot(customRenderDot(item))
    if (item.dot) return wrapCustomDot(item.dot as React.ReactNode)

    // Pending dot
    if (isPending) {
      if (pendingDot) {
        return wrapCustomDot(pendingDot)
      }
      return <div className={getPendingDotClasses()} />
    }

    // Default dot with optional color
    const dotClasses = getTimelineDotClasses(item.color)
    const dotStyle = item.color ? { backgroundColor: item.color } : {}

    return <div className={dotClasses} style={dotStyle} />
  }

  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const key = getItemKey(item, index)
    const isLast = index === processedItems.length - 1 && !pending
    const position = item.position

    const itemClasses = getTimelineItemClasses(mode, position, isLast)
    const tailClasses = getTimelineTailClasses(mode, position, isLast)
    const headClasses = getTimelineHeadClasses(mode, position)
    const contentClasses = getTimelineContentClasses(mode, position)

    if (renderItem) {
      return (
        <li key={key} className={itemClasses}>
          <div className={tailClasses} />
          <div className={headClasses}>{renderDotElement(item)}</div>
          <div className={contentClasses}>{renderItem(item, index)}</div>
        </li>
      )
    }

    // Default item render
    return (
      <li key={key} className={itemClasses}>
        <div className={tailClasses} />
        <div className={headClasses}>{renderDotElement(item)}</div>
        <div className={contentClasses}>
          {item.label && <div className={timelineLabelClasses}>{item.label}</div>}
          {item.content && <div className={timelineDescriptionClasses}>{item.content}</div>}
        </div>
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
    const headClasses = getTimelineHeadClasses(mode, position)
    const contentClasses = getTimelineContentClasses(mode, position)

    return (
      <li key="pending" className={itemClasses}>
        <div className={headClasses}>{renderDotElement({}, true)}</div>
        <div className={contentClasses}>
          {pendingContent || <div className={timelineDescriptionClasses}>Loading...</div>}
        </div>
      </li>
    )
  }

  return (
    <ul
      {...ulProps}
      className={containerClasses}
      aria-busy={ulProps['aria-busy'] ?? (pending ? true : undefined)}>
      {processedItems.map((item, index) => renderTimelineItem(item, index))}
      {renderPendingItem()}
    </ul>
  )
}
