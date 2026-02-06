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

  const currentGroup = useMemo(() => {
    if (resolvedGroups.length === 0) return undefined
    if (currentGroupKey === undefined) return resolvedGroups[0]
    const index = resolvedGroups.findIndex(
      (group, groupIndex) => getGroupKey(group, groupIndex) === currentGroupKey
    )
    return index >= 0 ? resolvedGroups[index] : resolvedGroups[0]
  }, [currentGroupKey, resolvedGroups])

  const currentGroupItems = currentGroup?.items ?? []

  // --- Internal read-state management ---
  const [readStateOverrides, setReadStateOverrides] = useState(
    () => new Map<string | number, boolean>()
  )

  // Reset overrides when source items change
  useEffect(() => {
    if (manageReadState) setReadStateOverrides(new Map())
  }, [items, manageReadState])

  const applyReadOverrides = (list: NotificationItem[]): NotificationItem[] => {
    if (!manageReadState || readStateOverrides.size === 0) return list
    return list.map((item) => {
      const override = readStateOverrides.get(item.id)
      return override !== undefined ? { ...item, read: override } : item
    })
  }

  const effectiveGroups = useMemo(
    () =>
      resolvedGroups.map((group) => ({
        ...group,
        items: applyReadOverrides(group.items)
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedGroups, readStateOverrides]
  )

  const effectiveCurrentGroup = useMemo(() => {
    if (effectiveGroups.length === 0) return undefined
    if (currentGroupKey === undefined) return effectiveGroups[0]
    const index = effectiveGroups.findIndex(
      (group, groupIndex) => getGroupKey(group, groupIndex) === currentGroupKey
    )
    return index >= 0 ? effectiveGroups[index] : effectiveGroups[0]
  }, [currentGroupKey, effectiveGroups])

  const effectiveCurrentGroupItems = effectiveCurrentGroup?.items ?? []
  const effectiveItems = useMemo(() => applyReadOverrides(items), [items, readStateOverrides]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasUnread = effectiveCurrentGroupItems.some((item) => !item.read)

  const totalUnread = useMemo(() => {
    const allItems = effectiveGroups.flatMap((group) => group.items)
    if (allItems.length === 0) return effectiveItems.filter((item) => !item.read).length
    return allItems.filter((item) => !item.read).length
  }, [effectiveGroups, effectiveItems])

  const wrapperClasses = useMemo(
    () => classNames('tiger-notification-center', 'w-full', 'flex', 'flex-col', className),
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
    if (manageReadState) {
      setReadStateOverrides((prev) => {
        const next = new Map(prev)
        effectiveCurrentGroupItems.forEach((item) => next.set(item.id, true))
        return next
      })
    }
    onMarkAllRead?.(currentGroupKey, effectiveCurrentGroupItems)
  }

  const renderItem = (item: NotificationItem, index: number) => {
    const isRead = Boolean(item.read)
    const timeText = item.time ? formatActivityTime(item.time) : ''

    return (
      <div
        className={classNames(
          'flex items-start gap-3 w-full py-0.5 transition-colors',
          !isRead &&
            'border-l-2 border-l-[var(--tiger-primary,#2563eb)] -ml-[2px] pl-[calc(0.75rem-2px)]'
        )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <Text tag="span" size="sm" weight={isRead ? 'normal' : 'semibold'}>
              {item.title}
            </Text>
            {timeText ? (
              <span className="text-xs text-[var(--tiger-text-muted,#6b7280)] whitespace-nowrap flex-shrink-0">
                {timeText}
              </span>
            ) : null}
          </div>
          {item.description ? (
            <div className="mt-0.5 text-xs text-[var(--tiger-text-muted,#6b7280)] line-clamp-2 leading-relaxed">
              {item.description}
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="ghost"
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
    <div className="flex items-center justify-center py-12">
      <Loading text={loadingText} />
    </div>
  ) : resolvedGroups.length > 0 ? (
    <div className="-mx-4 -mb-4">
      <Tabs type="line" size="small" activeKey={currentGroupKey} onChange={handleGroupChange}>
        {resolvedGroups.map((group, index) => {
          const effectiveGroup = effectiveGroups.find(
            (eg, ei) => getGroupKey(eg, ei) === getGroupKey(group, index)
          )
          const groupItems = effectiveGroup?.items ?? group.items
          const unreadCount = groupItems.filter((item) => !item.read).length
          const labelBase = group.title || String(group.key ?? index)
          const label = unreadCount > 0 ? `${labelBase} (${unreadCount})` : labelBase

          return (
            <TabPane
              key={String(getGroupKey(group, index))}
              tabKey={getGroupKey(group, index)}
              label={label}>
              <div className="max-h-[380px] overflow-y-auto">
                {renderList(filterItems(groupItems, currentReadFilter))}
              </div>
            </TabPane>
          )
        })}
      </Tabs>
    </div>
  ) : (
    <div className="-mx-4 -mb-4 max-h-[380px] overflow-y-auto">
      {renderList(filterItems(effectiveItems, currentReadFilter))}
    </div>
  )

  return (
    <div className={wrapperClasses} {...props} data-tiger-notification-center>
      <Card
        variant="bordered"
        className="w-full"
        header={
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Text tag="div" size="base" weight="bold">
                  {title}
                </Text>
                {totalUnread > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-[var(--tiger-primary,#2563eb)] text-white">
                    {totalUnread}
                  </span>
                ) : null}
              </div>
              <Button size="sm" variant="ghost" disabled={!hasUnread} onClick={handleMarkAllRead}>
                {markAllReadText}
              </Button>
            </div>
            <div className="inline-flex rounded-md border border-[var(--tiger-border,#e5e7eb)] overflow-hidden self-start">
              {filterButtons.map((option) => (
                <button
                  key={option.key}
                  className={classNames(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    'border-r border-[var(--tiger-border,#e5e7eb)] last:border-r-0',
                    currentReadFilter === option.key
                      ? 'bg-[var(--tiger-primary,#2563eb)] text-white'
                      : 'bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text-muted,#6b7280)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
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
