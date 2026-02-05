import React, { useMemo, useEffect, useState } from 'react'
import {
  classNames,
  buildNotificationGroups,
  formatActivityTime,
  type NotificationCenterProps as CoreNotificationCenterProps,
  type NotificationGroup,
  type NotificationItem,
  type NotificationReadFilter
} from '@expcat/tigercat-core'
import { Card } from './Card'
import { Tabs } from './Tabs'
import { TabPane } from './TabPane'
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

  const currentGroup = useMemo(() => {
    if (resolvedGroups.length === 0) return undefined
    if (currentGroupKey === undefined) return resolvedGroups[0]
    const index = resolvedGroups.findIndex(
      (group, groupIndex) => getGroupKey(group, groupIndex) === currentGroupKey
    )
    return index >= 0 ? resolvedGroups[index] : resolvedGroups[0]
  }, [currentGroupKey, resolvedGroups])

  const currentGroupItems = currentGroup?.items ?? []
  const hasUnread = currentGroupItems.some((item) => !item.read)

  const wrapperClasses = useMemo(
    () => classNames('tiger-notification-center', 'w-full', 'flex', 'flex-col', 'gap-4', className),
    [className]
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
    onMarkAllRead?.(currentGroupKey, currentGroupItems)
  }

  const renderItem = (item: NotificationItem, index: number) => {
    const isRead = Boolean(item.read)
    const timeText = item.time ? formatActivityTime(item.time) : ''

    return (
      <div className="flex items-start gap-3 w-full">
        <span
          className={classNames(
            'mt-2 h-2 w-2 rounded-full',
            isRead ? 'bg-gray-300' : 'bg-[var(--tiger-primary,#2563eb)]'
          )}
          aria-hidden="true"
        />
        <div className="flex-1 space-y-1">
          <Text tag="div" size="sm" weight="medium">
            {item.title}
          </Text>
          {item.description ? (
            <Text tag="div" size="sm" color="muted">
              {item.description}
            </Text>
          ) : null}
          {timeText ? (
            <Text tag="div" size="xs" color="muted">
              {timeText}
            </Text>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation()
            onItemReadChange?.(item, !isRead)
          }}>
          {isRead ? markUnreadText : markReadText}
        </Button>
      </div>
    )
  }

  const renderList = (listItems: NotificationItem[]) => (
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

  const filterButtons: Array<{ key: NotificationReadFilter; label: string }> = [
    { key: 'all', label: allLabel },
    { key: 'unread', label: unreadLabel },
    { key: 'read', label: readLabel }
  ]

  const content = loading ? (
    <div className="flex items-center justify-center py-6">
      <Loading text={loadingText} />
    </div>
  ) : resolvedGroups.length > 0 ? (
    <Tabs type="line" size="small" activeKey={currentGroupKey} onChange={handleGroupChange}>
      {resolvedGroups.map((group, index) => {
        const unreadCount = group.items.filter((item) => !item.read).length
        const labelBase = group.title || String(group.key ?? index)
        const label = unreadCount > 0 ? `${labelBase} (${unreadCount})` : labelBase

        return (
          <TabPane
            key={String(getGroupKey(group, index))}
            tabKey={getGroupKey(group, index)}
            label={label}>
            {renderList(filterItems(group.items, currentReadFilter))}
          </TabPane>
        )
      })}
    </Tabs>
  ) : (
    renderList(filterItems(items, currentReadFilter))
  )

  return (
    <div className={wrapperClasses} {...props} data-tiger-notification-center>
      <Card
        variant="bordered"
        className="w-full"
        header={
          <div className="flex items-center justify-between gap-3">
            <Text tag="div" size="sm" weight="medium">
              {title}
            </Text>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {filterButtons.map((option) => (
                  <Button
                    key={option.key}
                    size="sm"
                    variant={currentReadFilter === option.key ? 'primary' : 'outline'}
                    onClick={() => handleReadFilterChange(option.key)}>
                    {option.label}
                  </Button>
                ))}
              </div>
              <Button size="sm" variant="outline" disabled={!hasUnread} onClick={handleMarkAllRead}>
                {markAllReadText}
              </Button>
            </div>
          </div>
        }>
        {content}
      </Card>
    </div>
  )
}

export default NotificationCenter
