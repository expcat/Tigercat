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
import {
  activityFeedActionClasses,
  activityFeedItemSurfaceClasses,
  activityFeedAvatarClasses,
  activityFeedTitleClasses,
  activityFeedTimeClasses,
  activityFeedDescriptionClasses,
  activityFeedStateCardClasses,
  activityFeedLoadingClasses,
  activityFeedEmptyIconClasses,
  activityFeedGroupMarkerClasses,
  activityFeedGroupTitleClasses,
  activityFeedDotBaseClasses,
  activityFeedDotPulseBaseClasses,
  getActivityFeedDotClasses
} from '../../../core/src/internal/activity-feed-styles'
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
      className={activityFeedActionClasses}
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
      <div className={classNames(activityItemClasses, activityFeedItemSurfaceClasses)}>
        <div className={activityItemLayoutClasses}>
          {showAvatar && item.user ? (
            <Avatar
              size="sm"
              src={item.user.avatar}
              text={item.user.name}
              className={activityFeedAvatarClasses}
            />
          ) : null}
          <div className={activityItemBodyClasses}>
            <div className={activityItemHeaderClasses}>
              <div className={activityItemTitleGroupClasses}>
                {titleText ? (
                  <Text tag="div" size="sm" weight="semibold" className={activityFeedTitleClasses}>
                    {titleText}
                  </Text>
                ) : null}
                {item.status ? (
                  <Tag
                    variant={item.status.variant ?? 'default'}
                    size="sm"
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-current bg-current/10 shadow-sm">
                    {item.status.label}
                  </Tag>
                ) : null}
              </div>
              {timeText ? (
                <Text tag="div" size="xs" color="muted" className={activityFeedTimeClasses}>
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
                  activityFeedDescriptionClasses
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
          className={classNames('tiger-activity-feed-loading', activityFeedStateCardClasses)}>
          <div className="flex items-center justify-center py-8">
            <Loading text={loadingText} className={activityFeedLoadingClasses} />
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
          className={classNames('tiger-activity-feed-empty', activityFeedStateCardClasses)}>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <svg
              className={activityFeedEmptyIconClasses}
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
                    <span className={activityFeedGroupMarkerClasses} />
                    <Text
                      tag="span"
                      size="sm"
                      weight="bold"
                      className={activityFeedGroupTitleClasses}>
                      {groupTitle}
                    </Text>
                  </div>
                ))
              : null}
            <Timeline
              items={timelineItems}
              renderDot={(timelineItem) => {
                const activity = (timelineItem as ActivityTimelineItem).activity
                const statusVariant = (activity?.status?.variant ?? 'default') as string
                const dotClasses = getActivityFeedDotClasses(statusVariant)

                return (
                  <div className="relative flex items-center justify-center w-4 h-4">
                    {dotClasses.pulse ? (
                      <span className={`${activityFeedDotPulseBaseClasses} ${dotClasses.pulse}`} />
                    ) : null}
                    <span className={`${activityFeedDotBaseClasses} ${dotClasses.dot}`} />
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
