import React, { useMemo } from 'react'
import {
  classNames,
  buildActivityGroups,
  formatActivityTime,
  toActivityTimelineItems,
  activityItemClasses,
  activityItemLayoutClasses,
  activityItemBodyClasses,
  activityItemHeaderClasses,
  activityItemTitleGroupClasses,
  activityItemDescriptionClasses,
  activityItemActionsClasses,
  type ActivityFeedProps as CoreActivityFeedProps,
  type ActivityGroup,
  type ActivityItem,
  type ActivityAction,
  type ActivityTimelineItem
} from '@expcat/tigercat-core'
import { Timeline } from './Timeline'
import { Avatar } from './Avatar'
import { Tag } from './Tag'
import { Card } from './Card'
import { Text } from './Text'
import { Link } from './Link'
import { Loading } from './Loading'

export interface ActivityFeedProps
  extends
    Omit<CoreActivityFeedProps, 'renderItem' | 'renderGroupHeader'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  renderItem?: (item: ActivityItem, index: number, group?: ActivityGroup) => React.ReactNode
  renderGroupHeader?: (group: ActivityGroup) => React.ReactNode
}

const renderAction = (item: ActivityItem, action: ActivityAction, index: number) => {
  const key = action.key ?? `${item.id}-action-${index}`

  return (
    <Link
      key={key}
      size="sm"
      variant="primary"
      underline={false}
      href={action.href}
      target={action.target}
      disabled={action.disabled}
      className="inline-flex items-center px-2.5 py-1 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs font-semibold transition-all duration-200"
      onClick={() => action.onClick?.(item, action)}>
      {action.label}
    </Link>
  )
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items = [],
  groups,
  groupBy,
  groupOrder,
  loading = false,
  loadingText = '加载中...',
  emptyText = '暂无动态',
  showAvatar = true,
  showTime = true,
  showGroupTitle = true,
  renderItem,
  renderGroupHeader,
  className,
  ...props
}) => {
  const resolvedGroups = useMemo(
    () => buildActivityGroups(items, groups, groupBy, groupOrder),
    [items, groups, groupBy, groupOrder]
  )

  const wrapperClasses = classNames(
    'tiger-activity-feed',
    'flex',
    'flex-col',
    'gap-6',
    'w-full',
    className
  )

  const renderDefaultItem = (
    item: ActivityItem,
    index: number,
    group?: ActivityGroup
  ): React.ReactNode => {
    if (renderItem) return renderItem(item, index, group)

    const titleText =
      item.title ??
      (typeof item.content === 'string' || typeof item.content === 'number'
        ? String(item.content)
        : '')

    const descriptionText = item.description
    const timeText = showTime ? formatActivityTime(item.time) : ''

    const actionNodes = item.actions?.map((action, actionIndex) =>
      renderAction(item, action, actionIndex)
    )

    return (
      <div
        className={classNames(
          activityItemClasses,
          'p-4 rounded-2xl border border-gray-100/70 dark:border-gray-800/40 bg-white/40 dark:bg-gray-900/15 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-gray-100/30 dark:hover:shadow-none hover:bg-white dark:hover:bg-gray-900/30 hover:-translate-y-0.5 w-full'
        )}>
        <div className={activityItemLayoutClasses}>
          {showAvatar && item.user ? (
            <Avatar
              size="sm"
              src={item.user.avatar}
              text={item.user.name}
              className="shrink-0 ring-2 ring-white dark:ring-gray-900 shadow-sm transition-transform hover:scale-105 duration-200"
            />
          ) : null}
          <div className={activityItemBodyClasses}>
            <div className={activityItemHeaderClasses}>
              <div className={activityItemTitleGroupClasses}>
                {titleText ? (
                  <Text
                    tag="div"
                    size="sm"
                    weight="semibold"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate">
                    {titleText}
                  </Text>
                ) : null}
                {item.status ? (
                  <Tag
                    variant={item.status.variant ?? 'default'}
                    size="sm"
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-opacity-10 shadow-sm">
                    {item.status.label}
                  </Tag>
                ) : null}
              </div>
              {timeText ? (
                <Text
                  tag="div"
                  size="xs"
                  color="muted"
                  className="shrink-0 whitespace-nowrap font-medium text-gray-400 dark:text-gray-500">
                  {timeText}
                </Text>
              ) : null}
            </div>
            {descriptionText ? (
              <Text
                tag="div"
                size="sm"
                color="muted"
                className={classNames(
                  activityItemDescriptionClasses,
                  'text-gray-600 dark:text-gray-300 leading-relaxed pl-0.5 mt-1'
                )}>
                {descriptionText}
              </Text>
            ) : null}
            {actionNodes?.length ? (
              <div className={classNames(activityItemActionsClasses, 'mt-2.5')}>{actionNodes}</div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className={wrapperClasses}
        role="feed"
        aria-label="动态"
        aria-busy
        {...props}
        data-tiger-activity-feed>
        <Card
          variant="bordered"
          size="sm"
          className="tiger-activity-feed-loading bg-white/40 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <Loading text={loadingText} className="text-blue-500 dark:text-blue-400 font-medium" />
          </div>
        </Card>
      </div>
    )
  }

  if (resolvedGroups.length === 0) {
    return (
      <div
        className={wrapperClasses}
        role="feed"
        aria-label="动态"
        {...props}
        data-tiger-activity-feed>
        <Card
          variant="bordered"
          size="sm"
          className="tiger-activity-feed-empty bg-white/40 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h10.5m-10.5 3h10.5m-13.5-9h16.5M3 5.25h18M3 18.75h18"
              />
            </svg>
            <Text tag="div" size="sm" color="muted" className="font-medium">
              {emptyText}
            </Text>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={wrapperClasses}
      role="feed"
      aria-label="动态"
      {...props}
      data-tiger-activity-feed>
      {resolvedGroups.map((group, groupIndex) => {
        const headerNode = renderGroupHeader?.(group)
        const groupTitle = group.title
        const timelineItems = toActivityTimelineItems(group.items)

        return (
          <div key={group.key ?? groupIndex} className="space-y-3">
            {showGroupTitle && groupTitle
              ? (headerNode ?? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-3.5 bg-blue-500 rounded-full dark:bg-blue-400 shadow-sm shadow-blue-500/20" />
                    <Text
                      tag="span"
                      size="sm"
                      weight="bold"
                      className="text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      {groupTitle}
                    </Text>
                  </div>
                ))
              : null}
            <Timeline
              items={timelineItems}
              style={
                {
                  '--tiger-border': 'rgba(156, 163, 175, 0.18)'
                } as React.CSSProperties
              }
              renderDot={(timelineItem) => {
                const activity = (timelineItem as ActivityTimelineItem).activity
                const statusVariant = (activity?.status?.variant ?? 'default') as string

                const baseDotClass =
                  'w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 shadow-sm'
                let colorClass = 'bg-gray-300 dark:bg-gray-700'
                let pulseClass = ''

                if (statusVariant === 'success') {
                  colorClass = 'bg-emerald-500'
                  pulseClass = 'bg-emerald-500/30'
                } else if (statusVariant === 'warning') {
                  colorClass = 'bg-amber-500'
                  pulseClass = 'bg-amber-500/30'
                } else if (statusVariant === 'error' || statusVariant === 'danger') {
                  colorClass = 'bg-rose-500'
                  pulseClass = 'bg-rose-500/30'
                } else if (statusVariant === 'primary' || statusVariant === 'info') {
                  colorClass = 'bg-blue-500'
                  pulseClass = 'bg-blue-500/30'
                }

                return (
                  <div className="relative flex items-center justify-center w-4 h-4">
                    {pulseClass ? (
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 ${pulseClass}`}
                      />
                    ) : null}
                    <span className={`${baseDotClass} ${colorClass} relative z-10`} />
                  </div>
                )
              }}
              renderItem={(timelineItem, index) => {
                const activity = (timelineItem as ActivityTimelineItem).activity
                if (!activity) return null
                return renderDefaultItem(activity, index, group)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default ActivityFeed
