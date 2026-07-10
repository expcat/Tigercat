import React, { useMemo, useEffect, useState, useCallback } from 'react'
import {
  classNames,
  buildNotificationGroups,
  formatActivityTime,
  type NotificationCenterProps as CoreNotificationCenterProps,
  type NotificationGroup,
  type NotificationItem,
  type NotificationReadFilter
} from '@expcat/tigercat-core'
import {
  notificationCenterItemClasses,
  notificationCenterUnreadItemClasses,
  notificationCenterReadItemClasses,
  notificationCenterReadTitleClasses,
  notificationCenterUnreadTitleClasses,
  notificationCenterUnreadDotClasses,
  notificationCenterTimeClasses,
  notificationCenterReadDescriptionClasses,
  notificationCenterUnreadDescriptionClasses,
  notificationCenterItemActionClasses,
  notificationCenterEmptyIconWrapperClasses,
  notificationCenterEmptyIconClasses,
  notificationCenterEmptyTextClasses,
  notificationCenterLoadingClasses,
  notificationCenterCardClasses,
  notificationCenterTitleClasses,
  notificationCenterUnreadBadgeClasses,
  notificationCenterMarkAllBaseClasses,
  notificationCenterMarkAllEnabledClasses,
  notificationCenterMarkAllDisabledClasses,
  notificationCenterFilterGroupClasses,
  notificationCenterFilterButtonClasses,
  notificationCenterFilterActiveClasses,
  notificationCenterFilterIdleClasses
} from '../../../core/src/internal/notification-center-styles'
import { Card } from './Card'
import { Tabs, TabPane } from './Tabs'
import { List } from './List'
import { Text } from './Text'
import { Button } from './Button'
import { Loading } from './Loading'

export interface NotificationCenterProps
  extends CoreNotificationCenterProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

const getGroupKey = (group: NotificationGroup, index: number): string | number => {
  return group.key ?? group.title ?? index
}

const filterItems = (items: NotificationItem[], filter: NotificationReadFilter) => {
  return items.filter((item) => {
    const isRead = Boolean(item.read)
    if (filter === 'read') return isRead
    if (filter === 'unread') return !isRead
    return true
  })
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  items = [],
  groups,
  groupBy,
  groupOrder,
  activeGroupKey,
  defaultActiveGroupKey,
  readFilter,
  defaultReadFilter = 'all',
  loading = false,
  loadingText = '加载中...',
  emptyText = '暂无通知',
  title = '通知中心',
  allLabel = '全部',
  unreadLabel = '未读',
  readLabel = '已读',
  markAllReadText = '全部标记已读',
  markReadText = '标记已读',
  markUnreadText = '标记未读',
  manageReadState = false,
  onGroupChange,
  onReadFilterChange,
  onMarkAllRead,
  onItemClick,
  onItemReadChange,
  className,
  ...props
}) => {
  const resolvedGroups = useMemo(
    () => buildNotificationGroups(items, groups, groupBy, groupOrder),
    [items, groups, groupBy, groupOrder]
  )

  const firstGroupKey = useMemo(() => {
    return resolvedGroups.length > 0 ? getGroupKey(resolvedGroups[0], 0) : undefined
  }, [resolvedGroups])

  const [internalGroupKey, setInternalGroupKey] = useState<string | number | undefined>(
    defaultActiveGroupKey
  )

  const [internalReadFilter, setInternalReadFilter] =
    useState<NotificationReadFilter>(defaultReadFilter)

  const currentGroupKey = activeGroupKey ?? internalGroupKey ?? firstGroupKey
  const currentReadFilter = readFilter ?? internalReadFilter

  useEffect(() => {
    if (activeGroupKey !== undefined) return
    if (resolvedGroups.length === 0) {
      setInternalGroupKey(undefined)
      return
    }
    const keys = resolvedGroups.map((group, index) => getGroupKey(group, index))
    if (!keys.some((key) => key === currentGroupKey)) {
      setInternalGroupKey(keys[0])
    }
  }, [activeGroupKey, currentGroupKey, resolvedGroups])

  // --- Internal read-state management ---
  const [readStateOverrides, setReadStateOverrides] = useState(
    () => new Map<string | number, boolean>()
  )

  // Reset overrides when source items change
  useEffect(() => {
    if (manageReadState) setReadStateOverrides(new Map())
  }, [items, manageReadState])

  const applyReadOverrides = useCallback(
    (list: NotificationItem[]): NotificationItem[] => {
      if (!manageReadState || readStateOverrides.size === 0) return list
      return list.map((item) => {
        const override = readStateOverrides.get(item.id)
        return override !== undefined ? { ...item, read: override } : item
      })
    },
    [manageReadState, readStateOverrides]
  )

  const effectiveGroups = useMemo(
    () =>
      resolvedGroups.map((group) => ({
        ...group,
        items: applyReadOverrides(group.items)
      })),
    [resolvedGroups, applyReadOverrides]
  )

  const effectiveCurrentGroup = useMemo(() => {
    if (effectiveGroups.length === 0) return undefined
    if (currentGroupKey === undefined) return effectiveGroups[0]
    const index = effectiveGroups.findIndex(
      (group, groupIndex) => getGroupKey(group, groupIndex) === currentGroupKey
    )
    return index >= 0 ? effectiveGroups[index] : effectiveGroups[0]
  }, [currentGroupKey, effectiveGroups])

  const effectiveCurrentGroupItems = useMemo(
    () => effectiveCurrentGroup?.items ?? [],
    [effectiveCurrentGroup]
  )
  const effectiveItems = useMemo(() => applyReadOverrides(items), [items, applyReadOverrides])

  const hasUnread = useMemo(
    () => effectiveCurrentGroupItems.some((item) => !item.read),
    [effectiveCurrentGroupItems]
  )

  const totalUnread = useMemo(() => {
    const allItems = effectiveGroups.flatMap((group) => group.items)
    if (allItems.length === 0) return effectiveItems.filter((item) => !item.read).length
    return allItems.filter((item) => !item.read).length
  }, [effectiveGroups, effectiveItems])

  const wrapperClasses = useMemo(
    () => classNames('tiger-notification-center', 'w-full', 'flex', 'flex-col', className),
    [className]
  )

  const filterButtons = useMemo<Array<{ key: NotificationReadFilter; label: string }>>(
    () => [
      { key: 'all', label: allLabel },
      { key: 'unread', label: unreadLabel },
      { key: 'read', label: readLabel }
    ],
    [allLabel, unreadLabel, readLabel]
  )

  const groupTabData = useMemo(
    () =>
      resolvedGroups.map((group, index) => {
        const effectiveGroup = effectiveGroups.find(
          (eg, ei) => getGroupKey(eg, ei) === getGroupKey(group, index)
        )
        const groupItems = effectiveGroup?.items ?? group.items
        const unreadCount = groupItems.filter((item) => !item.read).length
        const labelBase = group.title || String(group.key ?? index)
        const label = unreadCount > 0 ? `${labelBase} (${unreadCount})` : labelBase
        const filteredItems = filterItems(groupItems, currentReadFilter)
        return { key: getGroupKey(group, index), label, filteredItems }
      }),
    [resolvedGroups, effectiveGroups, currentReadFilter]
  )

  const filteredFlatItems = useMemo(
    () => filterItems(effectiveItems, currentReadFilter),
    [effectiveItems, currentReadFilter]
  )

  const handleGroupChange = (key: string | number) => {
    if (activeGroupKey === undefined) {
      setInternalGroupKey(key)
    }
    onGroupChange?.(key)
  }

  const handleReadFilterChange = (next: NotificationReadFilter) => {
    if (readFilter === undefined) {
      setInternalReadFilter(next)
    }
    onReadFilterChange?.(next)
  }

  const handleMarkAllRead = () => {
    if (manageReadState) {
      setReadStateOverrides((prev) => {
        const next = new Map(prev)
        effectiveCurrentGroupItems.forEach((item) => next.set(item.id, true))
        return next
      })
    }
    onMarkAllRead?.(currentGroupKey, effectiveCurrentGroupItems)
  }

  const renderItem = (item: NotificationItem, _index: number) => {
    const isRead = Boolean(item.read)
    const timeText = item.time ? formatActivityTime(item.time) : ''

    return (
      <div
        className={classNames(
          notificationCenterItemClasses,
          isRead ? notificationCenterReadItemClasses : notificationCenterUnreadItemClasses
        )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Text
                tag="span"
                size="sm"
                weight={isRead ? 'normal' : 'semibold'}
                className={
                  isRead ? notificationCenterReadTitleClasses : notificationCenterUnreadTitleClasses
                }>
                {item.title}
              </Text>
              {!isRead && <span className={notificationCenterUnreadDotClasses} />}
            </div>
            {timeText ? <span className={notificationCenterTimeClasses}>{timeText}</span> : null}
          </div>
          {item.description ? (
            <div
              className={classNames(
                'mt-1 text-xs leading-relaxed line-clamp-2',
                isRead
                  ? notificationCenterReadDescriptionClasses
                  : notificationCenterUnreadDescriptionClasses
              )}>
              {item.description}
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className={notificationCenterItemActionClasses}
          onClick={(event) => {
            event.stopPropagation()
            if (manageReadState) {
              setReadStateOverrides((prev) => {
                const next = new Map(prev)
                next.set(item.id, !isRead)
                return next
              })
            }
            onItemReadChange?.(item, !isRead)
          }}>
          {isRead ? markUnreadText : markReadText}
        </Button>
      </div>
    )
  }

  const renderList = (listItems: NotificationItem[]) => {
    if (listItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
          <div className={notificationCenterEmptyIconWrapperClasses}>
            <svg
              className={notificationCenterEmptyIconClasses}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <Text tag="div" size="sm" color="muted" className={notificationCenterEmptyTextClasses}>
            {emptyText}
          </Text>
        </div>
      )
    }

    return (
      <List
        dataSource={listItems}
        split
        bordered="divided"
        hoverable
        emptyText={emptyText}
        onItemClick={(item, index) => onItemClick?.(item, index)}
        renderItem={renderItem}
      />
    )
  }

  const content = loading ? (
    <div className="flex items-center justify-center py-16">
      <Loading text={loadingText} className={notificationCenterLoadingClasses} />
    </div>
  ) : resolvedGroups.length > 0 ? (
    <div className="-mx-4 -mb-4">
      <Tabs
        type="line"
        size="small"
        activeKey={currentGroupKey}
        onActiveKeyChange={handleGroupChange}>
        {groupTabData.map((tab) => (
          <TabPane key={String(tab.key)} tabKey={tab.key} label={tab.label}>
            <div className="max-h-[380px] overflow-y-auto">{renderList(tab.filteredItems)}</div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  ) : (
    <div className="-mx-4 -mb-4 max-h-[380px] overflow-y-auto">{renderList(filteredFlatItems)}</div>
  )

  return (
    <div
      className={wrapperClasses}
      role={props.role ?? 'region'}
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : title)}
      {...props}
      data-tiger-notification-center>
      <Card
        variant="bordered"
        className={notificationCenterCardClasses}
        header={
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Text
                  tag="div"
                  size="base"
                  weight="bold"
                  className={notificationCenterTitleClasses}>
                  {title}
                </Text>
                {totalUnread > 0 ? (
                  <span className={notificationCenterUnreadBadgeClasses}>{totalUnread}</span>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={!hasUnread}
                onClick={handleMarkAllRead}
                className={classNames(
                  notificationCenterMarkAllBaseClasses,
                  hasUnread
                    ? notificationCenterMarkAllEnabledClasses
                    : notificationCenterMarkAllDisabledClasses
                )}>
                {markAllReadText}
              </Button>
            </div>
            <div className={notificationCenterFilterGroupClasses}>
              {filterButtons.map((option) => (
                <button
                  key={option.key}
                  className={classNames(
                    notificationCenterFilterButtonClasses,
                    currentReadFilter === option.key
                      ? notificationCenterFilterActiveClasses
                      : notificationCenterFilterIdleClasses
                  )}
                  onClick={() => handleReadFilterChange(option.key)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }>
        {content}
      </Card>
    </div>
  )
}

export default NotificationCenter
