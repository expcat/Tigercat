import React, { useMemo } from 'react'
import {
  classNames,
  EMPTY_ACTIVITY_ITEMS,
  buildActivityGroups,
  formatActivityTime,
  getActivityFeedLabels,
  mergeTigerLocale,
  resolveLocaleText,
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
import { Button } from './Button'
import { Loading } from './Loading'
import { useTigerConfig } from './ConfigProvider'

export interface ActivityFeedProps
  extends
    Omit<CoreActivityFeedProps, 'renderItem' | 'renderGroupHeader'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  renderItem?: (item: ActivityItem, index: number, group?: ActivityGroup) => React.ReactNode
  renderGroupHeader?: (group: ActivityGroup) => React.ReactNode
  renderLoading?: () => React.ReactNode
  renderEmpty?: () => React.ReactNode
}

const renderAction = (item: ActivityItem, action: ActivityAction, index: number) => {
  const key = action.key ?? `${item.id}-action-${index}`
  const onClick = (event?: React.MouseEvent) => {
    if (action.href === '#' || action.onClick) event?.preventDefault()
    if (action.disabled) return
    action.onClick?.(item, action)
  }
  if (!action.href) {
    return (
      <Button
        key={key}
        size="sm"
        variant="ghost"
        disabled={action.disabled}
        className={activityFeedActionClasses}
        onClick={onClick}>
        {action.label}
      </Button>
    )
  }
  return (
    <Link
      key={key}
      size="sm"
      variant="primary"
      underline={false}
      href={action.disabled ? undefined : action.href}
      target={action.target}
      disabled={action.disabled}
      className={activityFeedActionClasses}
      tabIndex={action.disabled ? -1 : undefined}
      onClick={onClick}>
      {action.label}
    </Link>
  )
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items = EMPTY_ACTIVITY_ITEMS,
  groups,
  groupBy,
  groupOrder,
  loading = false,
  loadingText,
  emptyText,
  locale,
  labels: labelsOverride,
  showAvatar = true,
  showTime = true,
  showGroupTitle = true,
  renderItem,
  renderGroupHeader,
  renderLoading,
  renderEmpty,
  className,
  ...props
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getActivityFeedLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const resolvedLoadingText = resolveLocaleText(labels.loadingText, loadingText)
  const resolvedEmptyText = resolveLocaleText(labels.emptyText, emptyText)

  const resolvedGroups = useMemo(
    () => buildActivityGroups(items, groups, groupBy, groupOrder, labels.otherGroupTitle),
    [items, groups, groupBy, groupOrder, labels.otherGroupTitle]
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

    const descriptionText =
      item.description ??
      (item.title && (typeof item.content === 'string' || typeof item.content === 'number')
        ? String(item.content)
        : undefined)
    const timeText = showTime ? formatActivityTime(item.time, mergedLocale) : ''

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

  const feedLabel = props['aria-labelledby']
    ? undefined
    : (props['aria-label'] ?? labels.listAriaLabel)

  if (loading && resolvedGroups.length === 0) {
    return (
      <div
        className={wrapperClasses}
        role="feed"
        aria-label={feedLabel}
        aria-busy
        {...props}
        data-tiger-activity-feed>
        <Card
          variant="bordered"
          size="sm"
          className={classNames('tiger-activity-feed-loading', activityFeedStateCardClasses)}>
          <div className="flex items-center justify-center py-8">
            {renderLoading?.() ?? (
              <Loading text={resolvedLoadingText} className={activityFeedLoadingClasses} />
            )}
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
        aria-label={feedLabel}
        {...props}
        data-tiger-activity-feed>
        <Card
          variant="bordered"
          size="sm"
          className={classNames('tiger-activity-feed-empty', activityFeedStateCardClasses)}>
          {renderEmpty?.() ?? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg
                aria-hidden="true"
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
                {resolvedEmptyText}
              </Text>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div
      className={wrapperClasses}
      role="feed"
      aria-label={feedLabel}
      aria-busy={loading || undefined}
      {...props}
      data-tiger-activity-feed>
      {resolvedGroups.map((group, groupIndex) => {
        const headerNode = renderGroupHeader?.(group)
        const groupTitle = group.title
        const timelineItems = toActivityTimelineItems(group.items)

        return (
          <div key={group.key ?? groupIndex} className="space-y-3">
            {showGroupTitle
              ? (headerNode ??
                (groupTitle ? (
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
                ) : null))
              : null}
            <Timeline
              items={timelineItems}
              renderDot={(timelineItem) => {
                const activity = (timelineItem as ActivityTimelineItem).activity
                const statusVariant = (activity?.status?.variant ?? 'default') as string
                const dotClasses = getActivityFeedDotClasses(statusVariant)

                return (
                  <div className="relative flex items-center justify-center w-2.5 h-2.5">
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
