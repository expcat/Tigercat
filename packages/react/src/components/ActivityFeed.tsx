import React, { useMemo } from 'react'
import {
  classNames,
  buildActivityGroups,
  formatActivityTime,
  toActivityTimelineItems,
  type ActivityFeedProps as CoreActivityFeedProps,
  type ActivityGroup,
  type ActivityItem,
  type ActivityAction,
  type TimelineItem
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
      href={action.href}
      target={action.target}
      disabled={action.disabled}
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
      <Card variant="bordered" size="sm" className="tiger-activity-item">
        <div className="flex gap-3 items-start">
          {showAvatar && item.user ? (
            <Avatar size="sm" src={item.user.avatar} text={item.user.name} className="shrink-0" />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {titleText ? (
                  <Text tag="div" size="sm" weight="medium" className="truncate">
                    {titleText}
                  </Text>
                ) : null}
                {item.status ? (
                  <Tag variant={item.status.variant ?? 'default'} size="sm" className="shrink-0">
                    {item.status.label}
                  </Tag>
                ) : null}
              </div>
              {timeText ? (
                <Text tag="div" size="xs" color="muted" className="shrink-0 whitespace-nowrap">
                  {timeText}
                </Text>
              ) : null}
            </div>
            {descriptionText ? (
              <Text tag="div" size="sm" color="muted" className="mb-2 break-words">
                {descriptionText}
              </Text>
            ) : null}
            {actionNodes?.length ? <div className="flex flex-wrap gap-2">{actionNodes}</div> : null}
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className={wrapperClasses} {...props} data-tiger-activity-feed>
        <Card variant="bordered" size="sm" className="tiger-activity-feed-loading">
          <div className="flex items-center justify-center py-4">
            <Loading text={loadingText} />
          </div>
        </Card>
      </div>
    )
  }

  if (resolvedGroups.length === 0) {
    return (
      <div className={wrapperClasses} {...props} data-tiger-activity-feed>
        <Card variant="bordered" size="sm" className="tiger-activity-feed-empty">
          <div className="flex items-center justify-center py-6">
            <Text tag="div" size="sm" color="muted">
              {emptyText}
            </Text>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={wrapperClasses} {...props} data-tiger-activity-feed>
      {resolvedGroups.map((group, groupIndex) => {
        const headerNode = renderGroupHeader?.(group)
        const groupTitle = group.title
        const timelineItems = toActivityTimelineItems(group.items, showTime)

        return (
          <div key={group.key ?? groupIndex} className="space-y-3">
            {showGroupTitle && groupTitle
              ? (headerNode ?? (
                  <Text tag="div" size="sm" weight="medium" color="muted">
                    {groupTitle}
                  </Text>
                ))
              : null}
            <Timeline
              items={timelineItems}
              renderItem={(timelineItem, index) => {
                const activity = (timelineItem as TimelineItem & { activity?: ActivityItem })
                  .activity
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
